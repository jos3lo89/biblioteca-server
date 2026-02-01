export class ReviewTreeNode {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userLastName: string;
  initials: string;
  parentId: string | null;
  createdAt: Date;
  children: ReviewTreeNode[];
}

export class CreateReviewResponse {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userLastName: string;
  initials: string;
  parentId: string | null;
  createdAt: Date;
}
