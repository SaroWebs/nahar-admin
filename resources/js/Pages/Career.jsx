import MasterLayout from '@/Layouts/MasterLayout';
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Loader, Alert, Pagination, Stack, Button, Text, Group } from '@mantine/core';
import { DownloadIcon, EyeIcon, EditIcon } from 'lucide-react';

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
            ) : items.length === 0 ? (
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
      <Button variant="light" color="blue" onClick={open} leftIcon={<IconEye size={14} />}>
        View Application
      </Button>
      <Modal opened={opened} onClose={close} size="70%">
        <div>
          <Text weight={500}>Name:</Text> <Text>{item.name}</Text>
          <Text weight={500}>Email:</Text> <Text>{item.email}</Text>
          <Text weight={500}>Phone:</Text> <Text>{item.phone}</Text>
          <Text weight={500}>Applied For:</Text> <Text>{item.applied_for}</Text>
          <Text weight={500}>Experience:</Text> <Text>{item.experience}</Text>
          <Text weight={500}>Branch:</Text> <Text>{item.branch}</Text>
          {item.file_path && (
            <Group mt="md">
              <Text weight={500}>Resume:</Text>
              <Button variant="link" component="a" href={item.file_path} download>
                Download Resume
              </Button>
            </Group>
          )}
        </div>
      </Modal>
    </>
  );
};

const ChangeStatus = ({ item, reload }) => {
  const [status, setStatus] = useState(item.status);

  const onChangeStatus = (newStatus) => {
    axios.put(`/applicants/${item.id}`, { status: newStatus })
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
    <Button variant="light" color="green" component="a" href={item.file_path} download leftIcon={<IconDownload size={14} />}>
      Download Resume
    </Button>
  );
};
