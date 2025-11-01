import { sendUnauthorizedResponse, verifyAdmin } from '../../../utils/adminMiddleware';
// FIX 1: Import 'supabaseAdmin' directly
import { supabaseAdmin } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the user is an admin
    const verification = await verifyAdmin(req);
    
    if (!verification.authorized) {
      return sendUnauthorizedResponse(res, verification);
    }

    // FIX 2: Remove this line.
    // The 'supabaseAdmin' variable already exists from the import above.
    // const supabaseAdmin = getSupabaseAdmin(); 

    // Create the new user
    const { email, password, full_name, role } = req.body;

    // Validate input
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user with admin client (this will now work)
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    });

    if (createError) {
      throw createError;
    }

    // Update the profile with role (this will also work)
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name,
          role,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        throw profileError;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create user' 
    });
  }
}