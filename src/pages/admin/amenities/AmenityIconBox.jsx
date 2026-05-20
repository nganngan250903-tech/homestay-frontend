import AppIcon from '../../../components/AppIcon'
import { amenityIconName } from './amenityUtils'

function AmenityIconBox({ name }) {
  return (
    <span className="amenity-detail-icon">
      <AppIcon name={amenityIconName(name)} />
    </span>
  )
}

export default AmenityIconBox
