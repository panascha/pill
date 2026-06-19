export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type DrugRole = 'admin' | 'student' | 'moderator'
export type SideEffectSeverity = 'mild' | 'moderate' | 'severe' | 'life-threatening'
export type SideEffectFrequency = 'very common (>10%)' | 'common (1-10%)' | 'uncommon (<1%)' | 'rare'
export type InteractionSeverity = 'minor' | 'moderate' | 'major' | 'contraindicated'
export type PregnancyCategory = 'A' | 'B' | 'C' | 'D' | 'X' | 'N'
export type ProposalActionType = 'ADD' | 'EDIT' | 'DELETE'
export type ProposalStatus = 'Pending' | 'Approved' | 'Rejected'

export interface DbUser {
  id: string
  email: string
  role: DrugRole
  created_at: string
}

export interface DrugClass {
  id: string
  name: string
  description_md: string | null
}

export interface Drug {
  id: string
  name: string
  brand_names_md: string | null
  drug_class_id: string | null
  mechanism_md: string
  pharmacokinetics_md: string | null
  indications_md: string
  contraindications_md: string | null
  dosing_md: string | null
  monitoring_md: string | null
  drug_interactions_md: string | null
  pregnancy_category: PregnancyCategory | null
  special_populations_md: string | null
  clinical_pearls_md: string | null
  last_updated_by: string
  updated_at: string
}

export interface SideEffect {
  id: string
  name: string
  severity: SideEffectSeverity | null
  mechanism_md: string | null
  management_md: string | null
}

export interface DrugSideEffect {
  drug_id: string
  side_effect_id: string
  frequency: SideEffectFrequency | null
  notes_md: string | null
}

export interface DrugInteraction {
  id: string
  drug_a_id: string
  drug_b_id: string
  severity: InteractionSeverity
  mechanism_md: string | null
  management_md: string | null
}

export interface Proposal {
  id: string
  action_type: ProposalActionType
  target_id: string | null
  proposed_data: Json
  requester_email: string
  status: ProposalStatus
  created_at: string
}

export interface DrugDetail extends Drug {
  class_name: string
  drug_classes: Pick<DrugClass, 'name' | 'description_md'> | null
  side_effects: Array<{
    name: string
    severity: SideEffectSeverity | null
    frequency: SideEffectFrequency | null
    notes_md: string | null
    mechanism_md: string | null
    management_md: string | null
  }>
  interactions: Array<{
    drug_name: string
    severity: InteractionSeverity
    mechanism_md: string | null
    management_md: string | null
  }>
}

export interface QuizDrug {
  id: string
  name: string
  mechanism_md: string
  indications_md: string
  pregnancy_category: PregnancyCategory | null
  drug_classes: Pick<DrugClass, 'id' | 'name'> | null
  drug_side_effects: Array<{
    frequency: SideEffectFrequency | null
    side_effects: Pick<SideEffect, 'id' | 'name' | 'severity'>
  }>
  drug_interactions_as_a: Array<{
    severity: InteractionSeverity
    drug_b_id: string
  }>
}

export interface ProposalWithDrug extends Proposal {
  drugs: Pick<Drug, 'name'> | null
}
