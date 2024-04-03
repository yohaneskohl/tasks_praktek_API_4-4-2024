// const { Pool } = require('pg'); // pg-pool
const router = require('express').Router();
const Pool = require('pg').Pool;

//pg-pool
const pool = new Pool({
  host: 'localhost',
  database: 'tasks_praktek',
  user: 'postgres',
  password: '12345',
  port: 5432
});

router.get('/', (req, res) => {
    res.render('index');
});

//menyambung /tasks/create
router.get('/tasks/create', (req, res) => {
    res.render('tasks/create');
})

router.post('/tasks', async function(req, res) {
    const { title, description, due_date, is_completed } = req.body;
  
    // Memeriksa apakah data yang diterima valid
    if (!title || !description || !due_date) {
      return res.status(400).json('Data yang diperlukan tidak lengkap');
    }
  
    try {
      let insert = await pool.query(
        'INSERT INTO tasks (title, description, due_date, is_completed) VALUES ($1, $2, $3, $4) returning *',
        [title, description, due_date, is_completed]
      );
      res.json(insert.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan pada server');
    }
  });
  

  //pagination
  router.get("/tasks", async function (req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const offset = (page - 1) * limit;
  
      let keyword = req.query.keyword;
  
      let psqlQuery = "SELECT * FROM tasks";
  
      if (keyword) {
        psqlQuery += ` WHERE description LIKE '%${keyword}%' OR due_date LIKE '%${keyword}%'`;
      }
  
      //
      psqlQuery += ` LIMIT $1 OFFSET $2`;
  
      let task = await pool.query(psqlQuery, [limit, offset]);
  
      const totalCount = await pool.query("SELECT COUNT(*) FROM tasks");
      const totalPages = Math.ceil(totalCount.rows[0].count / limit);
  
      const pagination = {
        page,
        limit,
        totalCount: totalCount.rows[0].count,
        totalPages,
      };
  
      res.status(200).json({
        status: true,
        message: null,
        data: task.rows,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  });
  
  router.get('/tasks', async function(req, res){
    try {
      let select = await pool.query(
        `select * from tasks`
      );
      res.send(select.rows);
    } catch (error) {
      console.error(error);
    };
  });
  
  // '/:id' untuk input secara dinamis dan tidak hardcode
  router.get('/tasks/:id', async function(req, res){
    //params = mengambil berdasarkan nilai
    let id = req.params.id;
    try {
      let select = await pool.query(
        `SELECT * FROM tasks WHERE id = $1`, [id]
      );
  
      // Jika tidak ada tugas yang ditemukan, kirim respons dengan status 404
      if (select.rows.length === 0) {
        return res.status(404).json({
          status: false,
          message: `cant find datas with it ${id}`
        });
      }
  
      res.send(select.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan pada server');
    };
  });
  
  router.get('/search', async function(req, res){
  
    const keyword = req.query.keyword;
    let psqlQuery = `SELECT * FROM tasks`;
  
    try {
     
      if (keyword) {
        psqlQuery += ` WHERE title LIKE '%${keyword}%' OR description LIKE '%${keyword}%'`;
      } 
      const tasks = await pool.query(psqlQuery);
  
      res.json(psqlQuery.rows[0]);
      // Jika tidak ada tugas yang ditemukan, kirim respons dengan status 404
      if (tasks.rows.length === 0) {
        return res.status(404).json({
          status: false,
          message: `Tidak dapat menemukan data dengan ID ${id}`
        });
      }
  
      res.json({
        status: true,
        message: 'Data tugas berhasil ditemukan',
        data: tasks.rows
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan pada server'
      });
    };
  });
  
  
  // '/:id' untuk input secara dinamis dan tidak hardcode
  router.put('/tasks/:id', async function(req, res){
    // Mendapatkan id, title, dan description dari req
    let id = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
  
    try {
      let select = await pool.query(
        `UPDATE tasks SET title = $1, description = $2 WHERE id = $3`, [title, description, id]
      );
      res.send(select.rows);
    } catch (error) {
      console.error(error);
    };
  });
  
  
  router.delete('/tasks/:id', async function(req, res){
    //params 
    let id = req.params.id;
  
    try {
      let select = await pool.query(
        `DELETE FROM tasks WHERE id = $1`, [id]
      );
  
      if (select.rowCount === 0) {
        return res.status(404).json('Tidak ada tugas dengan ID yang diberikan');
      }
  
      res.send('Tugas berhasil dihapus');
    } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan pada server');
    };
  });

//applisten
module.exports = router;