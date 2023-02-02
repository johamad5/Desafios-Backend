import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import passport from 'passport';
import {
	localSignupStategy,
	localLoginStrategy,
} from '../passport/localAuth.js';

const router = Router();

passport.use('/signup', localSignupStategy);
passport.use('/login', localLoginStrategy);

router.get('/', (req, res) => {
	res.redirect(`/login`);
});

router.get('/home', authRequired, (req, res) => {
	const username = req.session.passport.user;
	res.render('pages/home.ejs', { title: 'Listado', username });
});

router.get('/login', authRequired, (req, res) => {
	res.redirect(`/home`);
});

router.post(
	'/login',
	passport.authenticate(localLoginStrategy, {
		successRedirect: '/home',
		failureRedirect: '/loginError',
		passReqToCallback: true,
	})
);

router.get('/loginError', (req, res) => {
	res.render('pages/loginError.ejs');
});

router.get('/logout', (req, res) => {
	const username = req.session.passport.user;
	req.session.destroy((err) => {
		if (err) {
			return res.send({ status: 'Logout ERROR', body: err });
		} else {
			res.render('pages/logout.ejs', { username });
		}
	});
});

router.get('/signup', (req, res) => {
	res.render('pages/signup.ejs');
});

router.post(
	'/signup',
	passport.authenticate(localSignupStategy, {
		successRedirect: '/home',
		failureRedirect: '/signupError',
		passReqToCallback: true,
	})
);

router.get('/signupError', (req, res) => {
	res.render('pages/signupError.ejs');
});

router.get('/api/productos-test', async (req, res) => {
	res.render(`pages/test.ejs`, {
		title: 'Listado random',
	});
});

router.get('*', (req, res) => {
	res.status(404).send('ERROR: Ruta no existente');
});

export { router };