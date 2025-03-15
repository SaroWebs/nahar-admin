import MasterLayout from '@/Layouts/MasterLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Loader, Alert, Pagination, Stack, Button, Text, Group } from '@mantine/core';
import { EyeIcon, DownloadIcon } from 'lucide-react';

const Enquiries = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, show: 10, orderBy: 'created_at', order: 'desc' });
  const [pagination, setPagination] = useState({ total: 0, lastPage: 1 });

  const loadData = () => {
    setLoading(true);
    axios.get(`/data/enquiries?page=${pageInfo.page}&show=${pageInfo.show}&orderBy=${pageInfo.orderBy}&order=${pageInfo.order}`)
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
      <Head title="Enquiries" />
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        {errors && <Alert withCloseButton onClose={() => setErrors(null)}>{errors}</Alert>}
        <Stack>
          <div className="bg-white p-6 text-gray-900 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <h1 className="text-2xl font-semibold">Enquiries</h1>
            </div>
            {loading ? (
              <div className="flex justify-center">
                <Loader className="mx-auto" />
              </div>
            ) : !items || items.length === 0 ? (
              <div className="flex justify-center">
                <span>No Enquiries Found</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-auto rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold">
                      <th className="p-3 border-b">Name</th>
                      <th className="p-3 border-b">Email</th>
                      <th className="p-3 border-b">Phone</th>
                      <th className="p-3 border-b text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.email}</td>
                        <td className="p-3">{item.phone}</td>
                        <td className="p-3 text-right flex gap-2 justify-end">
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

export default Enquiries;

const ViewItem = ({ item }) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="light" color="blue" onClick={open} leftIcon={<EyeIcon size={14} />}>
        View Enquiry
      </Button>
      <Modal opened={opened} onClose={close} size="70%">
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Enquiry Details</h1>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
          </div>
          <div className='w-full'>
            <p className="text-gray-600 font-medium">Message:</p>
            <p className="text-lg text-gray-800">{item.message}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <p className="text-gray-600 font-medium">Website:</p>
              <p className="text-lg text-gray-800">{item.website}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Product:</p>
              <p className="text-lg text-gray-800">{item.product}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Quantity:</p>
              <p className="text-lg text-gray-800">{item.quantity}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <p className="text-gray-600 font-medium">City:</p>
              <p className="text-lg text-gray-800">{item.city}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Region:</p>
              <p className="text-lg text-gray-800">{item.region}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Pin:</p>
              <p className="text-lg text-gray-800">{item.pin}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Branch Type:</p>
              <p className="text-lg text-gray-800">{item.branch_type}</p>
            </div>
          </div>
        </div>

        </div>
      </Modal>
    </>
  );
};
