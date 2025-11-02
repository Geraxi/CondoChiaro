import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'tenant' | 'supplier'
  full_name?: string
}

export async function signUp(email: string, password: string, fullName: string, role: 'admin' | 'tenant' | 'supplier', companyName?: string) {
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          company_name: companyName || null,
        }
      }
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Errore durante la creazione dell\'utente')
    }

    // 2. Create user profile in database
    const { error: profileError } = await supabase
      .from('admins')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        company_name: companyName || null,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
      })

    if (profileError) {
      // If profile creation fails, try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return {
      success: true,
      message: 'Registrazione completata! Controlla la tua email per confermare l\'account.',
      user: authData.user
    }

  } catch (error) {
    console.error('SignUp error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Errore durante la registrazione',
      user: null
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (!data.user) {
      throw new Error('Credenziali non valide')
    }

    // Get user role from metadata
    const role = data.user.user_metadata?.role || 'tenant'

    return {
      success: true,
      message: 'Accesso effettuato con successo',
      user: data.user,
      role
    }

  } catch (error) {
    console.error('SignIn error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Errore durante l\'accesso',
      user: null,
      role: null
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true, message: 'Logout effettuato con successo' }
  } catch (error) {
    console.error('SignOut error:', error)
    return { success: false, message: 'Errore durante il logout' }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    return {
      success: true,
      message: 'Email di reset password inviata! Controlla la tua casella di posta.'
    }

  } catch (error) {
    console.error('ResetPassword error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Errore durante l\'invio dell\'email di reset'
    }
  }
}

export async function getCurrentUser(): Promise<{ user: User | null; role: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role || 'tenant'
    return { user, role }
  } catch (error) {
    console.error('GetCurrentUser error:', error)
    return { user: null, role: null }
  }
}

export async function updateProfile(userId: string, updates: {
  full_name?: string
  company_name?: string
}) {
  try {
    const { error } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', userId)

    if (error) throw error

    return { success: true, message: 'Profilo aggiornato con successo' }

  } catch (error) {
    console.error('UpdateProfile error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Errore durante l\'aggiornamento del profilo'
    }
  }
}