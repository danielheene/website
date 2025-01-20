import { cn } from '@/utilities/cn'

export const Icon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 1000 1000"
    className={cn(className)}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M1000 1000H0V0h1000v1000ZM527.1 245h73.4v204h176.1V245H850v510h-73.4V521.9H600.5V755H527V245ZM150 245h190.8c72.6 0 132 58.3 132 131.1v247c0 72.2-59.4 131.9-132 131.9H150V245Zm73.4 72.9v363.5h117.4a58.7 58.7 0 0 0 58.7-58.3v-247c0-32-25.7-58.2-58.7-58.2H223.4Z"
    />
  </svg>
)
