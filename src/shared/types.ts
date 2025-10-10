import z from "zod";
import type { MochaUser } from '@getmocha/users-service/shared';

// Extend MochaUser type to include profile
export interface ExtendedMochaUser extends MochaUser {
  profile?: {
    user_type: 'user' | 'admin';
  };
}

// Schema para validação de Local
export const LocalSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  endereco: z.string().optional(),
  esporte: z.string().optional(),
  valor_hora: z.number().positive("Valor por hora deve ser positivo").optional(),
  disponibilidade: z.string().optional(),
  fotos: z.string().optional(), // JSON string de array de URLs
  telefone: z.string().optional(),
  user_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const CreateLocalSchema = LocalSchema.omit({ 
  id: true, 
  user_id: true, 
  created_at: true, 
  updated_at: true 
});

export const UpdateLocalSchema = CreateLocalSchema.partial();

export type Local = z.infer<typeof LocalSchema>;
export type CreateLocal = z.infer<typeof CreateLocalSchema>;
export type UpdateLocal = z.infer<typeof UpdateLocalSchema>;

// Schema para autenticação (mesmo que usando Mocha Users Service)
export const RegisterSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória")
});

export const RecoverSchema = z.object({
  email: z.string().email("Email inválido")
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RecoverData = z.infer<typeof RecoverSchema>;

// Schema para perfil de usuário
export const UserProfileSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  user_type: z.enum(['user', 'admin']).default('user'),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const CreateUserProfileSchema = UserProfileSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>;

// Schema para reservas
export const ReservaSchema = z.object({
  id: z.number().optional(),
  local_id: z.number(),
  user_id: z.string(),
  data_reserva: z.string(), // YYYY-MM-DD format
  hora_inicio: z.string(), // HH:MM format
  hora_fim: z.string(), // HH:MM format
  status: z.enum(['ativa', 'cancelada', 'concluida']).default('ativa'),
  observacoes: z.string().optional(),
  valor_total: z.number().positive().optional(),
  avaliacao: z.number().min(1).max(5).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Campos extras para JOINs
  local_nome: z.string().optional(),
  local_endereco: z.string().optional(),
  local_esporte: z.string().optional()
});

export const CreateReservaSchema = ReservaSchema.omit({ 
  id: true, 
  user_id: true, 
  created_at: true, 
  updated_at: true,
  local_nome: true,
  local_endereco: true,
  local_esporte: true
}).partial({ status: true });

export const UpdateReservaSchema = ReservaSchema.omit({ 
  id: true, 
  user_id: true, 
  local_id: true,
  created_at: true, 
  updated_at: true 
}).partial();

export type Reserva = z.infer<typeof ReservaSchema>;
export type CreateReserva = z.infer<typeof CreateReservaSchema>;
export type UpdateReserva = z.infer<typeof UpdateReservaSchema>;
