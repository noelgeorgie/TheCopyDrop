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

    const { userId, newRole } = req.body;
    if (!userId || !newRole) {
      return res.status(400).json({ error: 'Missing userId or newRole' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select();

    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User profile not found to update' });
    }

    return res.status(200).json({ success: true, message: 'Role updated' });

  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to update role' 
    });
  }
}
