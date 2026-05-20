import HomeSections from './HomeSections'
import useCustomerRooms from './useCustomerRooms'

function HomePage() {
  const rooms = useCustomerRooms()

  return <HomeSections rooms={rooms} />
}

export default HomePage
