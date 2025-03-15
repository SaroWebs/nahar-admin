import MasterLayout from '@/Layouts/MasterLayout';
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Loader, Alert, Pagination, Stack, Button, Text, Group } from '@mantine/core';
import { DownloadIcon, EyeIcon } from 'lucide-react';

const Career = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errors, setErrors] = useState(null);
	const [pageInfo, setPageInfo] = useState({ page: 1, show: 10, orderBy: 'name', order: 'asc' });
	const [pagination, setPagination] = useState({ total: 0, lastPage: 1 });

	const loadData = () => {
		setLoading(true);
		axios.get(`/data/applicants?page=${pageInfo.page}&show=${pageInfo.show}&orderBy=${pageInfo.orderBy}&order=${pageInfo.order}`)
			.then(res => {
				setItems(res.data.data);
				setPagination({ total: res.data.total, lastPage: res.data.last_page });
			})
			.catch(error => setErrors(error.response?.data?.message))
			.finally(() => setLoading(false));
	};

	useEffect(() => { loadData(); }, [pageInfo]);
	useEffect(() => { if (errors) setTimeout(() => setErrors(null), 5000); }, [errors]);

	return (
		<MasterLayout>
			<Head title="Applicants" />
			<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
				{errors && <Alert withCloseButton onClose={() => setErrors(null)}>{errors}</Alert>}
				<Stack>
					<div className="bg-white p-6 text-gray-900">
						<div className="flex justify-between mb-4">
							<h1 className="text-xl font-semibold">Applicants</h1>
						</div>
						{loading ? (
							<div className="flex justify-center">
								<Loader className="mx-auto" />
							</div>
						) : !items || items.length === 0 ? (
							<div className="flex justify-center">
								<span>No Applications</span>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse border border-gray-200 shadow-md">
									<thead>
										<tr className='bg-gray-100 text-left'>
											<th className="p-3 border-b">Name</th>
											<th className="p-3 border-b">Email</th>
											<th className="p-3 border-b">Phone</th>
											<th className="p-3 border-b text-right">Actions</th>
										</tr>
									</thead>
									<tbody>
										{items.map(item => (
											<tr key={item.id} className="hover:bg-gray-50 border-b">
												<td className="p-3">{item.name}</td>
												<td className="p-3">{item.email}</td>
												<td className="p-3">{item.phone}</td>
												<td className="p-3 flex gap-2 justify-end">
													<ChangeStatus item={item} reload={loadData} />
													<DownloadFile item={item} />
													<ViewItem item={item} />
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
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

export default Career;

const ViewItem = ({ item }) => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<>
			<Button variant="light" color="blue" onClick={open} leftIcon={<EyeIcon size={14} />}>
				View Application
			</Button>
			<Modal opened={opened} onClose={close} size="70%">
				<div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
					<h1 className="text-2xl font-semibold text-gray-800 mb-6">Application Details</h1>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-gray-600 font-medium">Name:</p>
							<p className="text-lg text-gray-800">{item.name}</p>
						</div>
						<div>
							<p className="text-gray-600 font-medium">Email:</p>
							<p className="text-lg text-gray-800">{item.email}</p>
						</div>
						<div>
							<p className="text-gray-600 font-medium">Phone:</p>
							<p className="text-lg text-gray-800">{item.phone}</p>
						</div>
						<div>
							<p className="text-gray-600 font-medium">Applied For:</p>
							<p className="text-lg text-gray-800">{item.applied_for}</p>
						</div>
						<div>
							<p className="text-gray-600 font-medium">Experience:</p>
							<p className="text-lg text-gray-800">{item.experience}</p>
						</div>
						<div>
							<p className="text-gray-600 font-medium">Branch:</p>
							<p className="text-lg text-gray-800">{item.branch}</p>
						</div>
					</div>

					{item.file_path && (
						<div className="mt-6">
							<p className="text-gray-600 font-medium">Resume:</p>
							<a href={item.file_path} download className="text-blue-600 hover:underline">
								Download Resume
							</a>
						</div>
					)}
				</div>

			</Modal>
		</>
	);
};

const ChangeStatus = ({ item, reload }) => {
	const [status, setStatus] = useState(item.status);

	const onChangeStatus = (newStatus) => {
		axios.post(`/data/applicants/${item.id}?_method=PUT`, { status: newStatus })
			.then(() => {
				setStatus(newStatus);
				reload();
			})
			.catch((error) => console.error('Error updating status', error));
	};

	return (
		<div className="flex gap-2">
			<Button variant="outline" onClick={() => onChangeStatus('pending')} color={status === 'pending' ? 'blue' : 'gray'}>
				Pending
			</Button>
			<Button variant="outline" onClick={() => onChangeStatus('approved')} color={status === 'approved' ? 'green' : 'gray'}>
				Approved
			</Button>
			<Button variant="outline" onClick={() => onChangeStatus('onhold')} color={status === 'onhold' ? 'yellow' : 'gray'}>
				On Hold
			</Button>
			<Button variant="outline" onClick={() => onChangeStatus('rejected')} color={status === 'rejected' ? 'red' : 'gray'}>
				Rejected
			</Button>
		</div>
	);
};

const DownloadFile = ({ item }) => {
	return (
		<Button variant="light" color="green" component="a" href={item.file_path} download leftIcon={<DownloadIcon size={14} />}>
			Download Resume
		</Button>
	);
};
