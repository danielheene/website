import { registerFonts } from '@pdf/fonts'
import type { Styles } from '@react-pdf/renderer'
import { round } from 'lodash-es'

const { PPSupplySans, PPSupplyMono, PPFrama, PPFramaText } = registerFonts([
  'PPSupplySans',
  'PPSupplyMono',
  'PPFrama',
  'PPFramaText',
])

export const colors = {
  primary: '#1D27F2',
  white: '#FFFFFF',
  gray: {
    '50': '#FAFAFA',
    '100': '#F5F5F5',
    '200': '#E5E5E5',
    '300': '#D4D4D4',
    '400': '#A1A1A1',
    '500': '#737373',
    '600': '#525252',
    '700': '#404040',
    '800': '#262626',
    '900': '#171717',
    '950': '#0A0A0A',
  },
  black: '#000000',

  get textHeader() {
    return colors.gray['700']
  },
  get textHeadline() {
    return colors.primary
  },
  get textIntroduction() {
    return colors.gray['900']
  },
  get textBody() {
    return colors.gray['900']
  },
  get textJobInterval() {
    return colors.gray['500']
  },
  get textJobTitle() {
    return colors.gray['700']
  },
  get textFooterNote() {
    return colors.gray['500']
  },
  get textFooterPagination() {
    return colors.gray['700']
  },
}

export const textStyles = {
  __body: {
    color: colors.textBody,
    fontFamily: PPFrama,
    fontSize: 10,
    lineHeight: 1.4,
    letterSpacing: 0.35,
  },

  get header() {
    return {
      color: colors.textHeader,
      fontFamily: PPSupplyMono,
      fontSize: 10,
      lineHeight: 1.5,
      letterSpacing: -0.3,
      textDecoration: 'none',
    } as Styles[string]
  },
  get headline() {
    return {
      color: colors.textHeadline,
      fontFamily: PPSupplySans,
      fontSize: 18,
    } as Styles[string]
  },
  get introduction() {
    return {
      color: colors.textIntroduction,
      fontFamily: PPFrama,
      fontSize: 12,
      lineHeight: 1.4,
    }
  },
  get jobInterval() {
    return {
      color: colors.textJobInterval,
      fontFamily: PPSupplyMono,
      fontSize: 10,
    } as Styles[string]
  },
  get jobTitle() {
    return {
      color: colors.textJobTitle,
      fontFamily: PPSupplySans,
      fontSize: 14,
      fontWeight: 500,
      letterSpacing: 0.3,
    } as Styles[string]
  },
  get bulletPoint() {
    return {
      ...this.__body,
    } as Styles[string]
  },
  get skillNameWithCaption() {
    return {
      fontWeight: 500,
    } as Styles[string]
  },
  get footerNote() {
    return {
      color: colors.textFooterNote,
      fontFamily: PPSupplyMono,
      fontSize: 8,
      fontWeight: 400,
    } as Styles[string]
  },
  get footerPagination() {
    return {
      color: colors.textFooterPagination,
      fontFamily: PPSupplyMono,
      fontSize: 8,
      fontWeight: 500,
    } as Styles[string]
  },
}

export const mmToPt = (mm: number) => round(mm * 2.8346, 4)

export const sizes = {
  documentWidth: mmToPt(210),
  get documentInnerWidth() {
    return this.documentWidth - this.page.paddingLeft - this.page.paddingRight
  },

  documentHeight: mmToPt(297),
  get documentInnerHeight() {
    return this.documentHeight - this.page.paddingTop - this.page.paddingBottom
  },

  page: {
    paddingTop: mmToPt(15),
    paddingRight: mmToPt(15),
    paddingBottom: mmToPt(7.5),
    paddingLeft: mmToPt(15),
  },

  header: {
    paddingBottom: mmToPt(10),
    width: '100%',
  },
  body: {
    rowGap: mmToPt(10),
    width: '100%',
  },
  footer: {
    paddingTop: mmToPt(10),
    width: '100%',
  },

  headlinePaddingTop: mmToPt(10),
  paragraphRowGap: mmToPt(10),

  columnLeftWidth: mmToPt(45),
  get columnRightWidth() {
    return this.documentInnerWidth - this.columnLeftWidth
  },
}
