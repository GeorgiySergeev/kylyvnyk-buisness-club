export type IntroductionMemberStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED';

export function getMemberStatusLabelKey(status: IntroductionMemberStatus) {
  if (status === 'UNDER_REVIEW') return 'statusUnderReview';
  if (status === 'APPROVED') return 'statusApproved';
  if (status === 'REJECTED') return 'statusRejected';
  if (status === 'CLOSED') return 'statusClosed';
  return 'statusSubmitted';
}

export function shouldShowMemberAdminNote(status: IntroductionMemberStatus) {
  return status === 'APPROVED' || status === 'REJECTED';
}
