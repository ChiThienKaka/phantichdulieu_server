import { DataTypes, Model } from 'sequelize';
import sequelize from '../configs/sequelize';

class Baibao extends Model {
  public id!: number;
    public tieu_de?: string
    public mo_ta?: string
    public noi_dung?: string
    public chu_de?: string
    public the_loai?: string
    public ngay_dang?: Date
    public link?: string
    public tac_gia?: string
    public tu_khoa?: string
}
Baibao.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,//Tự động tăng
    primaryKey: true,
  },
  tieu_de: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mo_ta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  noi_dung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  chu_de: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  the_loai: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ngay_dang: {
    type: DataTypes.DATE,
    allowNull: true
  },
  link: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tac_gia:{
    type: DataTypes.TEXT,
    allowNull: true
  },
  tu_khoa: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
    sequelize:sequelize,
    modelName:'baibao',//Tên model này sẽ ánh xạ đến bảng dữ liệu trên database
    tableName: 'baibao',//Tên được đặt trên database
    createdAt: false,
    timestamps:false, //Thời gian tạo
});

export default Baibao;
