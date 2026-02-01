export class MyRatingResponse {
  rating: number | null;
}

export class RatingSummaryResponse {
  average: number;
  total: number;
}

export class SetRatingResponse {
  action: 'created' | 'updated' | 'removed';
  rating: number;
}
