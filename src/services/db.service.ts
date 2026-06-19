import { supabase } from './supabase'
import type {
  DrugDetail,
  QuizDrug,
  ProposalWithDrug,
  ProposalActionType,
  Json,
} from '../lib/types/database.types'

export async function getQuizPool(options: { classId?: string; limit?: number } = {}): Promise<QuizDrug[]> {
  const { classId, limit = 20 } = options

  let query = supabase
    .from('drugs')
    .select(`
      id, name, mechanism_md, indications_md, pregnancy_category,
      drug_classes ( id, name ),
      drug_side_effects (
        frequency,
        side_effects ( id, name, severity )
      ),
      drug_interactions_as_a: drug_interactions!drug_a_id (
        severity, drug_b_id
      )
    `)
    .limit(limit)

  if (classId) query = query.eq('drug_class_id', classId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as QuizDrug[]
}

export async function getDrugDetail(drugId: string): Promise<DrugDetail> {
  const { data, error } = await supabase
    .from('drugs')
    .select(`
      *,
      drug_classes ( name, description_md ),
      drug_side_effects (
        frequency, notes_md,
        side_effects ( name, severity, mechanism_md, management_md )
      ),
      drug_interactions_as_a: drug_interactions!drug_a_id (
        severity, mechanism_md, management_md,
        drug_b: drugs!drug_b_id ( id, name )
      )
    `)
    .eq('id', drugId)
    .single()

  if (error) throw error

  const raw = data as any
  return {
    ...raw,
    class_name: raw.drug_classes?.name ?? 'Unknown',
    side_effects: (raw.drug_side_effects ?? []).map((dse: any) => ({
      name: dse.side_effects.name,
      severity: dse.side_effects.severity,
      frequency: dse.frequency,
      notes_md: dse.notes_md,
      mechanism_md: dse.side_effects.mechanism_md,
      management_md: dse.side_effects.management_md,
    })),
    interactions: (raw.drug_interactions_as_a ?? []).map((di: any) => ({
      drug_name: di.drug_b.name,
      severity: di.severity,
      mechanism_md: di.mechanism_md,
      management_md: di.management_md,
    })),
  }
}

export async function searchDrugs(query: string): Promise<{ id: string; name: string; drug_class_id: string | null }[]> {
  const { data, error } = await supabase
    .from('drugs')
    .select('id, name, drug_class_id')
    .ilike('name', `%${query}%`)
    .limit(20)
  if (error) throw error
  return data ?? []
}

export async function getDrugClasses(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase.from('drug_classes').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}

export async function submitProposal(
  actionType: ProposalActionType,
  targetId: string | null,
  proposedData: Json,
  requesterEmail: string
): Promise<void> {
  const { error } = await supabase.from('proposals').insert([{
    action_type: actionType,
    target_id: targetId,
    proposed_data: proposedData,
    requester_email: requesterEmail,
  }])
  if (error) throw error
}

export async function getPendingProposals(): Promise<ProposalWithDrug[]> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*, drugs:target_id ( name )')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ProposalWithDrug[]
}

export async function approveProposal(proposalId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_proposal', { p_proposal_id: proposalId })
  if (error) throw error
}

export async function rejectProposal(proposalId: string): Promise<void> {
  const { error } = await supabase.rpc('reject_proposal', { p_proposal_id: proposalId })
  if (error) throw error
}
