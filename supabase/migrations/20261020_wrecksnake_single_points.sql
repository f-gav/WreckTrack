-- WreckSnake v0.3 changes scoring from ten points per food to one.
-- Apply once when upgrading the Edge Function; historical personal records
-- and completed sessions remain comparable to new results.
update public.wrecksnake_scores
   set best_score=best_score / 10,
       total_score=total_score / 10
 where best_score > 0 or total_score > 0;
update public.wrecksnake_sessions
   set score=score / 10
 where completed_at is not null and score is not null;
