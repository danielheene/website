import { Skeleton } from '@/components/Skeleton'

/** Matches `NavFooter`'s trigger button footprint while the user resolves. */
export const NavFooterSkeleton = () => {
  return (
    <footer className="nav-footer">
      <div className="nav-footer__trigger-wrapper">
        <div className="nav-footer__trigger">
          <Skeleton className="size-10 rounded-md shrink-0" />
          <div className="nav-footer__identity gap-1">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </footer>
  )
}
