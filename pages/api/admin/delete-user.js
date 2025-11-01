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
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // 3. Use the admin client to delete the user
    // This deletes the user from auth.users, and your database
    // trigger (or cascade) should handle deleting their profile.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, message: 'User deleted' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to delete user' 
    });
  }
}