import { Request, Response } from "express";
import { Baibao } from "../models";
import { Op, Sequelize } from "sequelize";

const getDashboard = async (req: Request, res: Response) => {
    try {
        // Lấy tổng số bài báo
        const totalArticles = await Baibao.count();

        // Lấy số chủ đề duy nhất
        const totalTopics = await Baibao.count({
            distinct: true,
            col: 'chu_de'
        });

        // Lấy số thể loại duy nhất
        const totalCategories = await Baibao.count({
            distinct: true,
            col: 'the_loai'
        });

        // Lấy số tác giả duy nhất
        const totalAuthors = await Baibao.count({
            distinct: true,
            col: 'tac_gia'
        });

        res.status(200).json({
            totalArticles,
            totalTopics,
            totalCategories,
            totalAuthors
        });
        return;
    } catch(e) {
        console.log(e);
        res.status(500).json({message: e});
        return;
    }
}

const getTopicsAndCategories = async (req: Request, res: Response) => {
    try {
        // Lấy danh sách chủ đề duy nhất
        const topics = await Baibao.findAll({
            attributes: ['chu_de'],
            group: ['chu_de'],
            limit: 6,
            raw: true
        });

        // Lấy danh sách thể loại và số lượng bài viết của mỗi thể loại
        const categories = await Baibao.findAll({
            attributes: [
                'the_loai',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count']
            ],
            limit: 6,
            group: ['the_loai'],
            raw: true
        });

        // Lấy danh sách tác giả và số lượng bài viết của mỗi tác giả
        const authors = await Baibao.findAll({
            attributes: [
                'tac_gia',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count']
            ],
            limit: 6,
            group: ['tac_gia'],
            order: [[Sequelize.literal('article_count'), 'DESC']],
            raw: true
        });

        res.status(200).json({
            topics: topics.map(t => t.chu_de),
            categories: categories,
            authors: authors
        });
        return;
    } catch(e) {
        res.status(500).json({message: e});
        return;
    }
}

const getDanhsachbaibao = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || '';
        const offset = (page - 1) * limit;

        const whereClause = search ? {
            tieu_de: {
                [Op.iLike]: `%${search}%`
            }
        } : {};

        const { count, rows } = await Baibao.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['ngay_dang', 'DESC']]
        });

        res.status(200).json({
            articles: rows,
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        });
        return;
    } catch(e) {
        res.status(500).json({message: e});
        return;
    }
}


/**
 * Trả về [{ year: 2023, count: 12 }, …]
 */
const getThongkeTheoNam = async (req: Request, res: Response) => {
    try {
        // Lấy tháng từ ngày đăng
        const monthExpr = Sequelize.fn(
            'date_part',
            Sequelize.literal("'month'"),
            Sequelize.col('ngay_dang')
        );

        const monthlyData = await Baibao.findAll({
            attributes: [
                [monthExpr, 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: [monthExpr],
            order: [[Sequelize.literal('"month"'), 'ASC']],
            raw: true
        });

        // Đảm bảo có đủ 12 tháng, nếu tháng nào không có dữ liệu thì count = 0
        const allMonths = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            count: 0
        }));

        monthlyData.forEach((item: any) => {
            const monthIndex = parseInt(item.month) - 1;
            allMonths[monthIndex].count = parseInt(item.count);
        });

        res.status(200).json(allMonths);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e });
    }
};



const getThongkeTheoTacGia = async (req: Request, res: Response) => {
    try {
        const authorData = await Baibao.findAll({
            attributes: [
                'tac_gia',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['tac_gia'],
            order: [[Sequelize.literal('count'), 'DESC']],
            limit: 8,
            raw: true
        });

        // Chuyển đổi dữ liệu để đảm bảo count là số
        const formattedData = authorData.map((item: any) => ({
            tac_gia: item.tac_gia,
            count: parseInt(item.count)
        }));

        res.status(200).json(formattedData);
    } catch(e) {
        console.error(e);
        res.status(500).json({message: e});
        return; 
    }
};

const getThongkeTheoTheLoai = async (req: Request, res: Response) => {
    try {
        const categoryData = await Baibao.findAll({
            attributes: [
                'the_loai',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['the_loai'],
            order: [[Sequelize.literal('count'), 'DESC']],
            raw: true
        });

        res.status(200).json(categoryData);
        return;
    } catch(e) {
        console.error(e);
        res.status(500).json({message: e});
        return;
    }
}

const getTacGia = async (req: Request, res: Response) => {
    try {
        const authors = await Baibao.findAll({
            attributes: [
                'tac_gia',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('the_loai'))), 'category_count'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('chu_de'))), 'topic_count']
            ],
            group: ['tac_gia'],
            order: [[Sequelize.literal('article_count'), 'DESC']],
            raw: true
        });

        // Lấy bài viết mới nhất của mỗi tác giả
        const latestArticles = await Promise.all(
            authors.map(async (author: any) => {
                const latestArticle = await Baibao.findOne({
                    where: { tac_gia: author.tac_gia },
                    order: [['ngay_dang', 'DESC']],
                    attributes: ['tieu_de', 'ngay_dang', 'the_loai', 'chu_de']
                });
                return {
                    ...author,
                    latest_article: latestArticle
                };
            })
        );

        res.status(200).json(latestArticles);
    } catch(e) {
        console.error(e);
        res.status(500).json({message: e});
    }
};

const getTapchiHoiThao = async (req: Request, res: Response) => {
    try {
        // Lấy danh sách thể loại và số lượng bài báo
        const categories = await Baibao.findAll({
            attributes: [
                'the_loai',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('tac_gia'))), 'author_count']
            ],
            group: ['the_loai'],
            order: [[Sequelize.literal('article_count'), 'DESC']],
            raw: true
        });

        // Lấy danh sách chủ đề và số lượng bài báo
        const topics = await Baibao.findAll({
            attributes: [
                'chu_de',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('tac_gia'))), 'author_count']
            ],
            group: ['chu_de'],
            order: [[Sequelize.literal('article_count'), 'DESC']],
            raw: true
        });

        // Lấy bài viết mới nhất cho mỗi thể loại
        const latestArticlesByCategory = await Promise.all(
            categories.map(async (category: any) => {
                const latestArticle = await Baibao.findOne({
                    where: { the_loai: category.the_loai },
                    order: [['ngay_dang', 'DESC']],
                    attributes: ['tieu_de', 'ngay_dang', 'tac_gia', 'chu_de']
                });
                return {
                    ...category,
                    latest_article: latestArticle
                };
            })
        );

        // Lấy bài viết mới nhất cho mỗi chủ đề
        const latestArticlesByTopic = await Promise.all(
            topics.map(async (topic: any) => {
                const latestArticle = await Baibao.findOne({
                    where: { chu_de: topic.chu_de },
                    order: [['ngay_dang', 'DESC']],
                    attributes: ['tieu_de', 'ngay_dang', 'tac_gia', 'the_loai']
                });
                return {
                    ...topic,
                    latest_article: latestArticle
                };
            })
        );

        res.status(200).json({
            categories: latestArticlesByCategory,
            topics: latestArticlesByTopic
        });
    } catch(e) {
        console.error(e);
        res.status(500).json({message: e});
    }
};

const getBaocao = async (req: Request, res: Response) => {
    try {
        // Tổng quan
        const totalArticles = await Baibao.count();
        const totalAuthors = await Baibao.count({
            distinct: true,
            col: 'tac_gia'
        });
        const totalCategories = await Baibao.count({
            distinct: true,
            col: 'the_loai'
        });
        const totalTopics = await Baibao.count({
            distinct: true,
            col: 'chu_de'
        });

        // Thống kê theo năm
        const yearlyStats = await Baibao.findAll({
            attributes: [
                [Sequelize.fn('date_part', Sequelize.literal("'year'"), Sequelize.col('ngay_dang')), 'year'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('tac_gia'))), 'author_count']
            ],
            group: [Sequelize.fn('date_part', Sequelize.literal("'year'"), Sequelize.col('ngay_dang'))],
            order: [[Sequelize.literal('year'), 'DESC']],
            raw: true
        });

        // Top tác giả có nhiều bài viết nhất
        const topAuthors = await Baibao.findAll({
            attributes: [
                'tac_gia',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('the_loai'))), 'category_count']
            ],
            group: ['tac_gia'],
            order: [[Sequelize.literal('article_count'), 'DESC']],
            limit: 5,
            raw: true
        });

        // Top thể loại có nhiều bài viết nhất
        const topCategories = await Baibao.findAll({
            attributes: [
                'the_loai',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('tac_gia'))), 'author_count']
            ],
            group: ['the_loai'],
            order: [[Sequelize.literal('article_count'), 'DESC']],
            limit: 5,
            raw: true
        });

        // Thống kê theo tháng của năm hiện tại
        const currentYear = new Date().getFullYear();
        const monthlyStats = await Baibao.findAll({
            attributes: [
                [Sequelize.fn('date_part', Sequelize.literal("'month'"), Sequelize.col('ngay_dang')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'article_count']
            ],
            where: Sequelize.where(
                Sequelize.fn('date_part', Sequelize.literal("'year'"), Sequelize.col('ngay_dang')),
                currentYear
            ),
            group: [Sequelize.fn('date_part', Sequelize.literal("'month'"), Sequelize.col('ngay_dang'))],
            order: [[Sequelize.literal('month'), 'ASC']],
            raw: true
        });

        res.status(200).json({
            overview: {
                totalArticles,
                totalAuthors,
                totalCategories,
                totalTopics
            },
            yearlyStats,
            topAuthors,
            topCategories,
            monthlyStats
        });
    } catch(e) {
        console.error(e);
        res.status(500).json({message: e});
    }
};

export {
    getDashboard, 
    getTopicsAndCategories, 
    getDanhsachbaibao,
    getThongkeTheoNam,
    getThongkeTheoTacGia,
    getThongkeTheoTheLoai,
    getTacGia,
    getTapchiHoiThao,
    getBaocao
}