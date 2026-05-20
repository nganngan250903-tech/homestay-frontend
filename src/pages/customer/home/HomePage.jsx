import HomeSections from './HomeSections'
import useCustomerRooms from './useCustomerRooms'

function HomePage(props) {
  const rooms = useCustomerRooms()

  return <HomeSections rooms={rooms} {...props} />
}

export default HomePage
