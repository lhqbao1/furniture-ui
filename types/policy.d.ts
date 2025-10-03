export interface PolicyResponse {
    id: string
    name: string
    created_at: string
    updated_at: string
    legal_policies: LegalPolicy[]
  }
  
  export interface LegalPolicy {
    id: string
    version_id: string
    name: string
    created_at: string
    updated_at: string
    child_legal_policies: ChildLegalPolicy[]
  }
  
  export interface ChildLegalPolicy {
    id: string
    legal_policy_id: string
    label: string
    tt: number
    content: string
    created_at: string
    updated_at: string
  }

  export interface PolicyVersion {
    id: string
    name: string
    created_at: Date
    updated_at: Date
  }