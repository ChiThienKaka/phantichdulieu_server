import { Router } from "express";
// import { registerManager,login,test } from "../../controllers/auth/manageController";
import { getDanhsachbaibao, getDashboard, getTopicsAndCategories, getThongkeTheoNam, getThongkeTheoTacGia, getThongkeTheoTheLoai, getTacGia, getTapchiHoiThao, getBaocao } from "../controllers/BaibaoController";
const router = Router();

router.get('/dashboard', getDashboard);
router.get('/topics-and-categories', getTopicsAndCategories);
router.get('/danhsachbaibao', getDanhsachbaibao);
router.get('/thongke-theo-nam', getThongkeTheoNam);
router.get('/thongke-theo-tacgia', getThongkeTheoTacGia);
router.get('/thongke-theo-theloai', getThongkeTheoTheLoai);
router.get('/tacgia', getTacGia);
router.get('/tapchi-hoi-thao', getTapchiHoiThao);
router.get('/baocao', getBaocao);

export default router