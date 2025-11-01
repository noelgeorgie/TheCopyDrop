import { sendUnauthorizedResponse, verifyAdmin } from '../../../lib/adminMiddleware';
import { getSupabaseAdmin, supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // Verify the user is an admin
    const verification = await verifyAdmin(req);
    
    if (!verification.authorized) {
      return sendUnauthorizedResponse(res, verification);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const adminUser = verification.user;

    // GET - Fetch all users
    if (req.method === 'GET') {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, updated_at')
        .order('updated_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Get auth users with admin client to access email
      const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        throw authError;
      }

      // Combine profile data with email from auth
      const combinedData = profilesData.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || 'N/A'
        };
      });

      return res.status(200).json({ users: combinedData });
    }

    // PUT - Update user role
    if (req.method === 'PUT') {
      const { userId, role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ error: 'Missing userId or role' });
      }

      // Validate role
      const validRoles = ['staff', 'front-office', 'scc-admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return res.status(200).json({ 
        success: true, 
        message: 'Role updated successfully' 
      });
    }

    // DELETE - Delete user
    if (req.method === 'DELETE') {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      // Prevent self-deletion
      if (userId === adminUser.id) {
        return res.status(400).json({ 
          error: 'Cannot delete your own account' 
        });
      }

      // Use admin client to delete user
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) throw error;

      return res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in manage-users API:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}