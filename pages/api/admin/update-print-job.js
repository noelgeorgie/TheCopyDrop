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

    const { jobId, newStatus } = req.body;
    if (!jobId || !newStatus) {
      return res.status(400).json({ error: 'Missing jobId or newStatus' });
    }

    let updateData = {
      status: newStatus
    };

    if (newStatus === 'completed') {
      updateData.handler_id = verification.user.id;
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('print_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select();

    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Print job not found' });
    }

    return res.status(200).json({ success: true, message: 'Job status updated' });

  } catch (error) {
    console.error('Error updating print job:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to update print job' 
    });
  }
}
