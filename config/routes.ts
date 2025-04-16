export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	// Thêm routes cho ứng dụng Travel Planner
	{
		path: '/travel-planner',
		name: 'Travel Planner',
		icon: 'CompassOutlined',
		component: '@/pages/TravelPlanner',
		routes: [
			{
				path: '/travel-planner',
				redirect: '/travel-planner/home',
			},
			{
				path: '/travel-planner/home',
				name: 'Khám phá điểm đến',
				icon: 'SearchOutlined',
				component: '@/pages/TravelPlanner/Home',
			},
			{
				path: '/travel-planner/trip',
				name: 'Lịch trình du lịch',
				icon: 'CalendarOutlined',
				component: '@/pages/TravelPlanner/Trip',
			},
			{
				path: '/travel-planner/admin',
				name: 'Quản trị',
				icon: 'SettingOutlined',
				component: '@/pages/TravelPlanner/Admin',
			},
		],
	},
	{
		path: '/',
		redirect: '/travel-planner',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
