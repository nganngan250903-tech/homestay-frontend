import { useEffect, useMemo, useState } from 'react'
import { getRoomPhotos, getRoomPricings, getRooms } from '../../../services/roomService'
import { fallbackRooms } from './homeConstants'
import { getRoomTypePrice } from './homeUtils'

function getRoomPhotoUrl(roomPhoto) {
  return roomPhoto.photo || roomPhoto.Photo || ''
}

function getRoomCardImage(room, index) {
  const latestPhoto = (room.roomPhotos || [])
    .slice()
    .sort((first, second) => (second.id || 0) - (first.id || 0))
    .map(getRoomPhotoUrl)
    .find(Boolean)

  return room.thumbnail || latestPhoto || room.roomType?.image || fallbackRooms[index % fallbackRooms.length].image
}

function useCustomerRooms() {
  const [rooms, setRooms] = useState([])
  const [pricings, setPricings] = useState([])

  useEffect(() => {
    Promise.all([getRooms(), getRoomPricings(), getRoomPhotos().catch(() => [])])
      .then(([roomData, pricingData, photoData]) => {
        const roomsWithPhotos = roomData.map((room) => ({
          ...room,
          roomPhotos: Array.isArray(room.roomPhotos) && room.roomPhotos.length > 0
            ? room.roomPhotos
            : photoData.filter((roomPhoto) => roomPhoto.room?.id === room.id),
        }))
        setRooms(roomsWithPhotos)
        setPricings(pricingData)
      })
      .catch(() => {
        setRooms([])
        setPricings([])
      })
  }, [])

  return useMemo(() => {
    return rooms.slice(0, 6).map((room, index) => ({
      ...room,
      id: room.id,
      name: room.name || room.roomType?.name || `Phong ${room.id}`,
      description: room.roomType?.description || room.description || 'Khong gian nghi ngoi thoai mai tai Lim Dim Homestay.',
      image: getRoomCardImage(room, index),
      maxGuest: room.roomType?.maxGuest,
      price: getRoomTypePrice(room.roomType || {}, pricings),
    }))
  }, [pricings, rooms])
}

export default useCustomerRooms
