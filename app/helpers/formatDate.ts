export const formatDate = (date?: Date) => 
  date ? new Date(date).toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  }) : 'Unknown';