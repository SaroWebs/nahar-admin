import MasterLayout from '@/Layouts/MasterLayout';
import { Head } from '@inertiajs/react';
import { useDisclosure } from '@mantine/hooks';
import { Button, Modal, Pagination, Loader, Alert, Stack } from '@mantine/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Categories = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errors, setErrors] = useState("");
	const [pageInfo, setPageInfo] = useState({
		page: 1,
		show: 10,
		orderBy: 'name',
		order: 'asc'
	});

	const [pagination, setPagination] = useState({
		total: 0,
		lastPage: 1
	});

	const loadData = () => {
		setLoading(true);
		axios.get(`/data/categories?page=${pageInfo.page}&show=${pageInfo.show}&orderBy=${pageInfo.orderBy}&order=${pageInfo.order}`)
			.then(res => {
				setItems(res.data.data);
				setPagination({ total: res.data.total, lastPage: res.data.last_page });
			})
			.catch(error => {
				setErrors(error.response?.data?.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		loadData();
	}, [pageInfo]);

	useEffect(() => {
		if (errors) {
			const timer = setTimeout(() => {
				setErrors(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [errors]);

	return (
		<MasterLayout>
			<Head title="Categories" />
			<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
				{errors ? (
					<div className="my-4">
						<Alert
							withCloseButton
							closeButtonLabel="Dismiss"
							onClose={() => setErrors(null)}
						>
							{errors}
						</Alert>
					</div>
				) : null}
				<Stack>
					<div className="bg-white p-6 text-gray-900">
						<div className="flex justify-between mb-4">
							<h1 className="text-xl font-semibold">Categories</h1>
							<CreateItem reload={loadData} />
						</div>


						{/* Table */}
						{loading ? (
							<div className="flex py-6 justify-center items-center">
								<Loader className="mx-auto" />
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse border border-gray-200 shadow-md">
									<thead>
										<tr className="bg-gray-100 text-left">
											<th className="p-3 border-b">Name</th>
											<th className="p-3 border-b">Type</th>
											<th className="p-3 border-b">Banner</th>
											<th className="p-3 border-b">Image</th>
											<th className="p-3 border-b text-center">Actions</th>
										</tr>
									</thead>
									<tbody>
										{items.length > 0 ? (
											items.map(item => (
												<tr key={item.id} className="hover:bg-gray-50 border-b">
													<td className="p-3">{item.name}</td>
													<td className="p-3">{item.type}</td>
													<td className="p-3 text-center">
														{item.banner_path && <img src={'storage/' + item.banner_path} alt="Banner" className="h-10 mx-auto" />}
													</td>
													<td className="p-3 text-center">
														{item.image_path && <img src={'storage/' + item.image_path} alt="Image" className="h-10 mx-auto" />}
													</td>
													<td className="p-3 text-center flex gap-2 justify-center">
														<EditItem item={item} reload={loadData} />
														<RemoveItem item={item} reload={loadData} />
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan="5" className="text-center p-4 text-gray-500">No categories found.</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						)}

						{/* Pagination */}
						<Pagination
							total={pagination.lastPage}
							value={pageInfo.page}
							onChange={(page) => setPageInfo((prev) => ({ ...prev, page }))}
							className="mt-4"
						/>
					</div>
				</Stack>
			</div>
		</MasterLayout>
	);
};

export default Categories;

const CreateItem = ({ reload }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [form, setForm] = useState({ name: '', type: '' });
	const [banner, setBanner] = useState(null);
	const [image, setImage] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleFileChange = (e, type) => {
		const file = e.target.files[0];
		if (type === 'banner') {
			setBanner(file);
		} else if (type === 'image') {
			setImage(file);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.type) {
			setError('Please select type.');
			return;
		}
		setLoading(true);
		const formData = new FormData();
		formData.append('name', form.name);
		formData.append('type', form.type);
		if (banner) formData.append('banner', banner);
		if (image) formData.append('image', image);

		axios.post('/data/categories', formData)
			.then(() => {
				reload();
				close();
			})
			.catch(error => {
				console.error(error);
				setError('An error occurred while creating the item. Please try again.');
			})
			.finally(() => setLoading(false));
	};

	return (
		<>
			<Button onClick={open}>Create</Button>
			<Modal opened={opened} onClose={close} title="Create Category">
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block text-sm font-medium">Name</label>
						<input type="text" className="w-full border p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium" htmlFor="type">Type</label>
						<select
							id="type"
							name="type"
							className='w-full'
							value={form.type}
							onChange={handleChange}
							disabled={loading}
							required
						>
							<option value="">-- Select a type --</option>
							<option value="natural">Natural</option>
							<option value="organic">Organic</option>
							<option value="na">NA</option>
						</select>
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium">Banner</label>
						<input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium">Image</label>
						<input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
					</div>
					<Button type="submit" loading={loading} fullWidth>Create</Button>
				</form>
			</Modal>
		</>
	);
};

const EditItem = ({ reload, item }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [form, setForm] = useState({ name: item.name, type: item.type });
	const [banner, setBanner] = useState(null);
	const [image, setImage] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleFileChange = (e, type) => {
		const file = e.target.files[0];
		if (type === 'banner') {
			setBanner(file);
		} else if (type === 'image') {
			setImage(file);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	  };

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.type) {
			setError('Please select type.');
			return;
		  }
		setLoading(true);
		const formData = new FormData();
		formData.append('name', form.name);
		formData.append('type', form.type);

		if (banner) {
			formData.append('banner', banner);
		}
		if (image) {
			formData.append('image', image);
		}

		axios.post(`/data/categories/${item.id}?_method=PUT`, formData, {
			headers: {
				"Content-Type": "multipart/formdata"
			}
		})
			.then((response) => {
				console.log(response);
				reload();
				close();
			})
			.catch(error => console.error(error))
			.finally(() => setLoading(false));
	};

	return (
		<>
			<Button onClick={open}>Edit</Button>
			<Modal opened={opened} onClose={close} title="Edit Category">
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block text-sm font-medium">Name</label>
						<input type="text" className="w-full border p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
					</div>

					<div className="mb-4">
            <label className="block text-sm font-medium" htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              className='w-full'
              value={form.type}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">-- Select a type --</option>
              <option value="natural">Natural</option>
              <option value="organic">Organic</option>
              <option value="na">NA</option>
            </select>
          </div>
					<div className="mb-4">
						<label className="block text-sm font-medium">Banner</label>
						<input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium">Image</label>
						<input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
					</div>
					<Button type="submit" loading={loading} fullWidth>Update</Button>
				</form>
			</Modal>
		</>
	);
};
const RemoveItem = ({ reload, item }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [loading, setLoading] = useState(false);

	const handleDelete = () => {
		setLoading(true);
		axios.delete(`/data/categories/${item.id}`)
			.then(() => {
				reload();
				close();
			})
			.catch(error => console.error(error))
			.finally(() => setLoading(false));
	};

	return (
		<>
			<Button color="red" onClick={open}>Delete</Button>
			<Modal opened={opened} onClose={close} title="Confirm Delete">
				<p>Are you sure you want to delete this category?</p>
				<Button color="red" onClick={handleDelete} loading={loading} fullWidth>Delete</Button>
			</Modal>
		</>
	);
};


