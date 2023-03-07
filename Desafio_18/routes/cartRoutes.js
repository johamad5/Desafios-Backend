import { Router } from 'express';
import { logger } from '../logs/loger.js';
import { authRequired } from '../middleware/auth.js';
import { CartController } from '../controllers/cartController.js';
import { UserController } from '../controllers/usersController.js';
import { createTransport } from 'nodemailer';
import { USER, PASS } from '../config/envConfig.js';
//import twilio from 'twilio';

//const accountSid = 'xxxxxxxxxxxxxxxx';
//const authToken = 'xxxxxxxxxxxxxxxxx';
//const client = twilio(accountSid, authToken);
const userDB = new UserController();
const cartDB = new CartController();
const cartRoutes = Router();
const transporter = createTransport({
	service: 'gmail',
	port: 587,
	auth: {
		user: USER,
		pass: PASS,
	},
});

cartRoutes.get('/', authRequired, async (req, res) => {
	const userEmail = req.session.passport.user;
	const { url, method } = req;
	logger.info(`Petición recibida por el servidor. Ruta ${method} - ${url}`);

	const value = await cartDB.getOne(userEmail);

	res.send(value);
});

cartRoutes.get('/add/:producId/:cant', authRequired, async (req, res) => {
	const userEmail = req.session.passport.user;
	const data = {
		userEmail,
		producId: req.params.producId,
		units: req.params.cant,
	};
	const { url, method } = req;

	logger.info(`Petición recibida por el servidor. Ruta ${method} - ${url}`);

	const value = await cartDB.saveProduct(data);
	res.send(value);
});

cartRoutes.get('/checkout', authRequired, async (req, res) => {
	const userEmail = req.session.passport.user;
	const { url, method } = req;
	logger.info(`Petición recibida por el servidor. Ruta ${method} - ${url}`);
	const user = await userDB.getOne(userEmail);
	const cart = await cartDB.getOne(userEmail);
	const products = cart.products;

	let productList = '';
	products.map((prod) => {
		let { productName, productQuantity } = prod;
		productList += `
			<tr>
				<td>${productName}</td>
				<td>${productQuantity}</td>
			</tr>
`;
	});

	const mailOptions = {
		from: 'Servidor',
		to: 'johanamadero3@gmail.com',
		subject: `Nuevo pedido de ${user.name}`,
		html: `<h2> Se registró un nuevo pedido en el sistema. <br/></h2>
		<h3>Productos: <h3/> <br/>
		<table>
			<tr>
				<th>Articulo</th>
				<th>Unidades</th>
			</tr>
${productList}
			</table>`,
	};

	try {
		const data = await transporter.sendMail(mailOptions);
		console.log(data);
	} catch (e) {
		logger.error(e);
	}

	/*try {
		const message = await client.messages.create({
			body: 'Hola soy un SMS desde Node.js!',
			from: '+14156884237',
			to: '+541199998888',
		});
		console.log(message);
	} catch (e) {
		logger.error(e);
	}*/
	res.send('Pedido realizado con exito');
});

export { cartRoutes };
