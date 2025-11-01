import { sendUnauthorizedResponse, verifyAdmin } from '../../../utils/adminMiddleware';
import { supabaseAdmin } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verify the user is an admin
    const verification = await verifyAdmin(req);
    if (!verification.authorized) {
      return sendUnauthorizedResponse(res, verification);
    }

    // 2. Get data from the request
    const { userId, newRole } = req.body;
    if (!userId || !newRole) {
      return res.status(400).json({ error: 'Missing userId or newRole' });
    }

    // 3. Use the admin client to update the profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select(); // Use .select() to confirm the update

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