const CategoryTag = ({ category }) => {
  const getCategoryColor = (name) => {
    switch (name) {
      case 'Full-Stack': return 'bg-green-100 text-green-800'
      case 'Front-End': return 'bg-blue-100 text-blue-800'
      case 'DevOps': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(category.name)}`}>
      {category.name}
    </span>
  )
}

export default CategoryTag