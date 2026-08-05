/*
 * What this CRM's policy modules are, and where the interesting values live on
 * them. Extracted from zoho-clients so the sync and anything else reading Zoho
 * resolve fields the same way — two copies of this logic would drift, and the
 * failure mode of drift here is a column that quietly reads blank.
 *
 * Everything is resolved from module metadata rather than hardcoded, because
 * every module names the same idea differently: the client lookup is
 * `Customer_Name` in four of them and `Account` in Policy_Details, the insurer
 * is `Insurance_Provider` here and `Insurance_Company` there, and Motor's
 * policy type is `Cover_Type` but labelled "Policy Type".
 */

import { zohoFetch } from './zoho.ts'

export const CLIENT_MODULE = Deno.env.get('ZOHO_CLIENT_MODULE') || 'Accounts'

/*
 * Modules whose records are history rather than current cover. Policy_Details
 * is an endorsement ledger (about two thirds of a 200-record sample carried no
 * expiry at all) and Renewal_Policy_Details is a dead archive whose most
 * recently modified rows are 2020-2022. They are still mirrored and still
 * counted — but they are excluded from renewal maths, because an archive that
 * expired in 2022 is not a renewal.
 */
export const LEGACY_MODULES = new Set(
  (Deno.env.get('ZOHO_LEGACY_POLICY_MODULES') ?? 'Policy_Details,Renewal_Policy_Details')
    .split(',').map((s) => s.trim()).filter(Boolean),
)

export interface PolicyModule {
  api_name: string
  label: string
  legacy: boolean
}

interface ZohoModule {
  api_name: string
  plural_label: string
  generated_type: string
  api_supported: boolean
}

export interface ZohoField {
  api_name: string
  field_label?: string
  data_type: string
  lookup?: { module?: { api_name?: string } }
}

export interface PolicyShape {
  lookup: string | null
  expiry: string | null
  expiryIsDateTime: boolean
  issued: string | null
  number: string | null
  type: string | null
  insurer: string | null
  status: string | null
  premium: string | null
}

let policyModulesCache: PolicyModule[] | null = null
const fieldCache = new Map<string, ZohoField[]>()
const shapeCache = new Map<string, PolicyShape>()

/*
 * Claims are excluded: a claims register is a different thing from cover, and
 * mixing them under one heading would misrepresent both. Subforms and field
 * trackers are excluded too — they are api_supported and would otherwise slip
 * through the name match.
 */
export async function detectPolicyModules(): Promise<PolicyModule[]> {
  const override = Deno.env.get('ZOHO_POLICY_MODULES')
  if (override) {
    return override.split(',').map((s) => s.trim()).filter(Boolean).map((api_name) => ({
      api_name, label: api_name, legacy: LEGACY_MODULES.has(api_name),
    }))
  }
  if (policyModulesCache) return policyModulesCache

  const res = await zohoFetch<{ modules: ZohoModule[] }>('/crm/v7/settings/modules')

  policyModulesCache = (res.modules ?? [])
    .filter((m) => m.api_supported)
    .filter((m) => m.generated_type === 'custom' || m.generated_type === 'default')
    /*
     * Zoho creates a File_Upload_N__s module behind every file-upload FIELD,
     * and labels it with the field's own name — so this org has modules called
     * "Policy Schedule", "Policy Document" and "Policy Cover Document" that are
     * attachment stores, not cover. They matched the name test below, cost a
     * metadata call each, and were then discarded for having no client lookup.
     * Excluded by shape rather than by label, since the labels are whatever
     * someone typed into a field.
     */
    .filter((m) => !/^File_Upload_\d+__s$/.test(m.api_name))
    .filter((m) => {
      const hay = `${m.api_name} ${m.plural_label}`
      return /polic|insur|cover/i.test(hay) && !/claim/i.test(hay)
    })
    .map((m) => ({
      api_name: m.api_name,
      label: m.plural_label || m.api_name,
      legacy: LEGACY_MODULES.has(m.api_name),
    }))

  return policyModulesCache
}

/*
 * v7 makes `fields` MANDATORY when fetching records — omitting it is a 400
 * REQUIRED_PARAM_MISSING, not a default-everything. (v2 allowed it, which is
 * why most examples online leave it out.)
 */
export async function fieldMetaFor(module: string): Promise<ZohoField[]> {
  const hit = fieldCache.get(module)
  if (hit) return hit

  const res = await zohoFetch<{ fields?: ZohoField[] }>(
    `/crm/v7/settings/fields?module=${encodeURIComponent(module)}`,
  )
  const fields = res.fields ?? []
  fieldCache.set(module, fields)
  return fields
}

/**
 * Find one field by data type and a pattern tested against BOTH api_name and
 * field_label. Matching either alone misses: the two disagree constantly here.
 */
function findField(meta: ZohoField[], types: string[], pattern: RegExp): string | null {
  const hit = meta.find((f) =>
    types.includes(f.data_type) && pattern.test(`${f.api_name} ${f.field_label ?? ''}`))
  return hit?.api_name ?? null
}

export async function shapeOf(module: string): Promise<PolicyShape> {
  const hit = shapeCache.get(module)
  if (hit) return hit

  const meta = await fieldMetaFor(module)
  // Only real date fields are considered, which is what keeps Policy_Details'
  // `Endorsement_date` — a text field — from being mistaken for an expiry.
  const expiry = findField(meta, ['date', 'datetime'], /expir/i)
  const expiryMeta = meta.find((f) => f.api_name === expiry)

  const shape: PolicyShape = {
    lookup: meta.find(
      (f) => f.data_type === 'lookup' && f.lookup?.module?.api_name === CLIENT_MODULE,
    )?.api_name ?? null,
    expiry,
    expiryIsDateTime: expiryMeta?.data_type === 'datetime',
    issued: findField(meta, ['date', 'datetime'], /issue/i),
    // `Name` is the Policy Number in every one of these modules.
    number: meta.some((f) => f.api_name === 'Name') ? 'Name' : null,
    type: findField(meta, ['picklist'], /polic\w*.?type|cover.?type|select.?polic/i),
    insurer: findField(meta, ['picklist'], /insurance.?(provider|company)/i),
    status: findField(meta, ['picklist'], /polic\w*.?status|status.*polic/i),
    // Anchored, because every module also carries `Premium_Paid_by_Customer`
    // and similar; metadata order puts the base premium first.
    premium: findField(meta, ['currency'], /^premium/i),
  }

  shapeCache.set(module, shape)
  return shape
}

/* Types the REST read cannot return inline; asking for them fails the call. */
const UNREADABLE = new Set(['subform', 'multiselectlookup', 'multiuserlookup', 'linking'])

/**
 * The field list to request for a module, capped at Zoho's limit.
 *
 * Everything readable is asked for, not just the resolved columns, so the
 * mirror keeps the whole record. Storing only the eight fields we name today
 * would mean a full re-sync the first time anyone wants a ninth.
 */
export async function readableFields(module: string): Promise<string[]> {
  const meta = await fieldMetaFor(module)
  return meta
    .filter((f) => !UNREADABLE.has(f.data_type))
    .map((f) => f.api_name)
    .slice(0, 48)
}

/** A Zoho value as a plain string, or null. Lookups collapse to their name. */
export function text(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'object' && 'name' in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>).name)
  }
  return String(v)
}

/** The id half of a lookup. */
export function lookupId(v: unknown): string | null {
  if (v && typeof v === 'object' && 'id' in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>).id)
  }
  return null
}

/**
 * The leading calendar date of a Zoho date or datetime.
 *
 * Renewal_Policy_Details stores datetimes at +04:00. Truncating rather than
 * parsing is what the CRM itself shows, and avoids a UTC render shifting a
 * policy a day earlier than the broker wrote it.
 */
export function asDate(v: unknown): string | null {
  if (typeof v !== 'string' || !v) return null
  const m = v.match(/^\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : null
}
