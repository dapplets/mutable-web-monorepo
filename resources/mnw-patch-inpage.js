// Near Wallet displays "Unknown App" for transactions with empty HTTP header "referer"
// It's a workaround replacing document.referrer value
if (new URL(document.location.href).searchParams.get('referrer') === 'mutable-web') {
  Object.defineProperty(document, 'referrer', {
    value: 'https://mutable-web/',
    writable: true,
    configurable: true,
  })
}
