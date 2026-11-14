/** Onay sonrası müşteriye iletilecek havale bilgileri. Herkese açık sayfalarda kullanılmaz. */
export const bankTransferInstructions = {
  recipientName: 'Ege Mutlu',
  iban: 'TR17 0006 2001 1810 0006 5942 93',
  relayNote:
    'Bu bilgiler herkese açık sitede gösterilmez. Başvuru onaylandıktan sonra müşterinin e-posta adresine iletin.',
} as const
