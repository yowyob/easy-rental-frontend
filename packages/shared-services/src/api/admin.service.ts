import { defaultClient as client } from './api-client';
import { extraService } from './extra.service';
import { orgService } from './org.service';
import { reviewService } from './review.service';
import { supportService } from './support.service';

export const adminService = {
  getAllOrganizations: () => orgService.getAllOrgs(),
  getPlans: () => extraService.getPlans(),
  createPlan: extraService.createPlan,
  updatePlan: extraService.updatePlanQuotas,
  assignPlan: (orgId: string, planName: string) => orgService.assignPlan(orgId, planName),
  approveOrganization: (orgId: string, reason?: string) =>
    client.post<Record<string, unknown>>(`/api/admin/organizations/${orgId}/approve`, { reason: reason ?? '' }),
  rejectOrganization: (orgId: string, reason?: string) =>
    client.post<Record<string, unknown>>(`/api/admin/organizations/${orgId}/reject`, { reason: reason ?? '' }),
  getSupportConversations: () => supportService.listConversations(),
  getSupportConversationMessages: (params: { email?: string; visitorSessionId?: string }) =>
    supportService.getAdminConversationMessages(params),
  replyToSupportConversation: (params: { email?: string; visitorSessionId?: string; body: string }) =>
    supportService.replyToConversation(params),
  markSupportConversationRead: (params: { email?: string; visitorSessionId?: string }) =>
    supportService.markConversationAsRead(params),
  getReviews: () => reviewService.listAllForAdmin(),
  getReviewModerationStats: () => reviewService.getModerationStats(),
  setReviewPublished: (id: string, published: boolean) => reviewService.setPublished(id, published),
};
