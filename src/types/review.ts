export interface TReview {
  id: string;
  mealId: string;
  mealName: string | null;
  userId: string;
  rating: number;
  feedback: string | null;
  createdAt: string | null;
}

export interface TSubmitReviewRequest {
  mealId: string;
  userId: string;
  rating: number;
  feedback?: string;
}

export interface TUpdateReviewRequest {
  rating?: number;
  feedback?: string;
}
