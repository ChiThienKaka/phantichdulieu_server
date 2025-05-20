import { Sequelize } from "sequelize";


// liên kết server offline 
const sequelize = new Sequelize("PhanTichData", "postgres", "chithien", {
    host: "localhost",
    dialect: 'postgres',//loại cơ sở dữ liệu mysql, postgres ...
    logging: false,
  });
  
  //Liên kết online
  // const sequelize = new Sequelize(DATABASE, USERNAME, PASSWORD, {
  //   host: hostname,
  //   dialect: 'postgres',//loại cơ sở dữ liệu mysql, postgres ...
  //   logging: false,
  //   dialectOptions: {
  //       ssl: {
  //         require: true,
  //         // Thêm tùy chọn này nếu bạn không có chứng chỉ SSL
  //         rejectUnauthorized: false 
  //       }
  //   }
  // });

  //Kiểm tra kết nối có thành công không
  sequelize.authenticate()
    .then(() => {
      console.log('Kết nối với postgreSQL đã được thiết lập thành công.')
    })
    .catch(err => console.error('Không thể kết nối với cơ sở dữ liệu postgreSQL:', err));
  


  export default sequelize;