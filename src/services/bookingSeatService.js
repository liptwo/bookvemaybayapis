/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
// import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/bookingFlightModel'
// import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { StatusCodes } from 'http-status-codes'
import { pickUser } from '~/utils/fomartter'
import { flightModel } from '~/models/flightModel'

const createBookingSeat = async (reqBody, inviterId) => {
  try {
    const userId = await userModel.findOneById(inviterId)
    const flight = await flightModel.findOneById(reqBody.flightId)
    const newBookingSeatData = {
      userId,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    )
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId.toString()
    )

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee
    // cho FE thoải mái xử lý.
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) {
    throw error
  }
}
const getBookingSeat = async(userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log('getInvitations service', getInvitations)

    // xử lý dữ liệu board, inviter, invitee đang là giá trị mảng giờ chuyển sang 
    // giá trị json
    // cách 1 khi muốn xử lý dữ liệu điều kiện gì đó
    // const resInvitations = getInvitations.map(i => {
    //   return {
    //     ...i,
    //     inviter: i.inviter[0] || {},
    //     invitee: i.invitee[0] || {},
    //     board: i.board[0] || {}
    //   }
    // })
    // casch 2 khi muốn return luôn
    const resInvitations = getInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))
    return resInvitations
  } catch (error) {
    throw error
  }
}
const updateBookingSeat = async(userId, invitationId, status) => {
  try {
    // tìm bản ghi invitation
    const getInvitation = await invitationModel.findOneById(invitationId)
    if ( !getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')
    // tìm bản ghi board lấy full thông tin
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if ( !getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    // Kiểm tra status coi Accept join board mà thằng user đã có trong chưa rồi thì báo lỗi
    // 2 mảng memberIds, ownerIds của board đang là object nên cho nó về string hết luôn để check
    const boardOwnersAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if ( status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnersAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'User are already member of this board!')
    }
    // tạo dữ liệu update bản ghi invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    // bước 1 cập nhập status trong Invitation
    const updateInvitation = await invitationModel.update(invitationId, updateData)
    // bước 2 nếu là accept thành công thì thêm user vào trong memberIds của collection board
    if ( updateInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMembers(boardId, userId)
    }
    return updateInvitation
  } catch (error) {
    throw error
  }
}

export const bookingSeatService = {
  createBookingSeat,
  getBookingSeat,
  updateBookingSeat
}
