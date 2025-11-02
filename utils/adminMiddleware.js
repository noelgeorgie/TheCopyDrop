// WRONG:
// import { supabaseAdmin } from './supabaseClient';

// RIGHT:
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Middleware to verify if a user is an admin
 * Use this in API routes to protect admin-only endpoints
 */
export async function verifyAdmin(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return { 
        authorized: false, 
        error: 'No authorization header',
        status: 401 
      };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // This will now work
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return { 
        authorized: false, 
        error: 'Invalid token or user not found',
        status: 401 
      };
    }

    // This will also work
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { 
        authorized: false, 
        error: 'Profile not found', 
        status: 403 
      };
    }

    if (profile.role !== 'scc-admin') {
      return { 
        authorized: false, 
        error: 'Forbidden: Admin access required',
        status: 403 
      };
    }

    // Return authorized with user info
    return { 
      authorized: true, 
      user: { ...user, ...profile }
    };

  } catch (error) {
    return { 
      authorized: false, 
      error: error.message || 'Verification failed',
      status: 500 
    };
  }
}

/**
 * Send error response for unauthorized requests
 */
export function sendUnauthorizedResponse(res, verification) {
  return res.status(verification.status || 401).json({ 
    error: verification.error 
  });
}
