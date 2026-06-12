// Tipos usados nas telas atuais: Clientes, Piscinas, Serviços, Cobranças, Pagamentos, Calendário

export interface Cliente {
  id: string;               // uuid (clientes.id)
  nome: string;
  sobrenome?: string;
  numero_celular?: string;  // coluna: numero_celular
  numero_telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
  user_id?: string;         // uuid (clientes.user_id)
  created_at?: string;      // timestamptz

  // Campos derivados usados na UI
  piscinas_count?: number;
}

export interface Piscina {
  id: string;               // uuid (piscinas.id)
  cliente_id: string;       // pode ser client_id ou cliente_id no DB; usar cliente_id no front
  tipo?: string | null;
  tamanho?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  user_id?: string | null;
  created_at?: string | null;
}

export interface Servico {
  id: string;               // uuid (servicos.id)
  user_id?: string | null;
  cliente_id: string;
  piscina_id: string;
  tipo_servico?: string | null;
  data_agendamento?: string | null; // yyyy-MM-dd
  horario?: string | null;          // HH:mm
  status?: string | null;           // ex: 'agendado','confirmado','concluido','cancelado'
  observacoes?: string | null;
  created_at?: string | null;

  // Campos auxiliares para UI
  cliente_nome?: string;
  piscina_tamanho?: string;
}

export interface Cobranca {
  id: string;               // uuid (cobrancas.id)
  user_id?: string | null;
  cliente_id?: string | null;
  servico_id?: string | null;
  valor?: number | null;
  data_vencimento?: string | null; // yyyy-MM-dd
  status?: string | null;          // ex: 'pendente','parcial','paga'
  created_at?: string | null;
}

export interface Pagamento {
  id: string;               // uuid (pagamentos.id)
  user_id?: string | null;
  cobranca_id: string;
  data_pagamento?: string | null; // yyyy-MM-dd
  valor_pago?: number | null;
  forma_pagamento?: string | null;
  observacoes?: string | null;
  created_at?: string | null;
}

// Tipo usado pelo Calendário / listagens simplificadas
export type EventoCalendario = {
  id: string;
  titulo?: string;
  clienteNome?: string;
  clienteId?: string;
  data?: string;        // yyyy-MM-dd
  horaInicio?: string;  // HH:mm
  tipo?: string;
  status?: string;
  observacoes?: string;
  valor?: number;
  userId?: string;
};
