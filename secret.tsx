// test-pendataan-tukik

// docker run -d \
//   --env COCKROACH_DATABASE={pendataan_test} \
//   --env COCKROACH_USER={derry} \
//   --env COCKROACH_PASSWORD={12345678} \
//   --name=test-pendataan-tukik \
//   --hostname=test-pendataan-tukik \
//   -p 26260:26260 \
//   -p 8083:8083 \
//   -v "test-pendataan-tukik:/cockroach/cockroach-data"  \
//   cockroachdb/cockroach:v24.2.3 start-single-node \
//   --http-addr=test-pendataan-tukik:8083

//   docker exec -it test-pendataan-tukik grep 'node starting' /cockroach/cockroach-data/logs/cockroach.log -A 11