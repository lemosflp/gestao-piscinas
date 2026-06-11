import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  // Ambiente sem Supabase: usar cliente falso para desenvolvimento/local — autenticação desativada
  console.warn('Variáveis do Supabase ausentes — usando cliente Supabase falso para desenvolvimento (autenticação desativada)')

  const makeBuilder = () => {
    const builder: any = {}
    const chain = () => builder
    builder.select = chain
    builder.insert = chain
    builder.update = chain
    builder.delete = chain
    builder.eq = chain
    builder.match = chain
    builder.order = chain
    builder.limit = chain
    builder.single = chain
    builder.returning = chain
    // torna awaitable: resolve com resultado vazio e sem erro
    builder.then = (resolve: any) => resolve({ data: [], error: null, count: 0 })
    builder.catch = (_: any) => builder
    return builder
  }

  supabase = {
    from: (_table: string) => makeBuilder(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async (_creds: any) => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    functions: { invoke: async () => ({ data: null, error: null }) },
    storage: { from: () => ({ download: async () => ({ data: null, error: null }) }) },
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }