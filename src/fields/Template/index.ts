import { TextField } from 'payload'

type TemplateFieldProps = {
  name: string
  label?: string | false
  description?: string
}

export const TemplateField = ({
  name,
  label = false,
  description,
}: TemplateFieldProps): TextField => {
  return {
    type: 'text',
    name,
    label,
    admin: {
      description,
      components: {
        Description: '@/components/AdminPanel#DescriptionWithNewline',
      },
    },
  }
}
