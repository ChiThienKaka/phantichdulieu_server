import express, { NextFunction, Request, Response} from 'express'
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import cors from 'cors';
import { Baibao } from './models';
import { BaibaoRoute } from './routes';

const app = express();

//cấu hình dịch request json từ client hoặc body-parser
app.use(express.json());

// Cấu hình các middeware bảo mật cơ bản 
app.use(hpp()); //bảo vệ khỏi các cuộc tấn công http
app.use(helmet()); //Bảo mật HTTP Headers
app.use(morgan("combined")); //Log các request HTTP gửi đến server

// Sử dụng middleware CORS
app.use(cors({
    origin: '*', // Tạm thời cho phép tất cả origin để kiểm tra
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // credentials: true
}));

//phân tích các đối tượng phức tạp, như các đối tượng lồng nhau hoặc mảng
//ví dụ khi sử dụng với formsubmit
app.use(express.urlencoded({extended: true}));

//Đồng bộ Model lên CSDL
Baibao.sync();

//cấu hình các router cần thiết
app.use('/admin', BaibaoRoute);
//Hotel - Properties - CRUD


export default app;