import { sendUnauthorizedResponse, verifyAdmin } from '../../../utils/adminMiddleware';
// WRONG:
// import { supabaseAdmin } from '../../../utils/supabaseClient';
// RIGHT:
import { supabaseAdmin } from '../../../utils/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const verification = await verifyAdmin(req);
    if (!verification.authorized) {
      return sendUnauthorizedResponse(res, verification);
    }

    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
      user: authData.user
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create user' 
    });
  }
}
