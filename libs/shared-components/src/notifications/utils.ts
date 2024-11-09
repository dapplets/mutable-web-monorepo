export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }
  const formattedDate = date.toLocaleString('en-US', options)
  const [monthDay, time] = formattedDate.split(', ')

  return `${monthDay} in ${time}`
}
