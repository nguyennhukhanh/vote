# MultiContestVoting Contract

## Mô tả

`MultiContestVoting` là một contract bỏ phiếu cho phép người vận hành (operator) tạo ra nhiều cuộc bỏ phiếu (vote) độc lập, với mỗi cuộc bỏ phiếu có danh sách ứng cử viên và thời gian bỏ phiếu riêng. Người dùng có thể bỏ phiếu cho một ứng cử viên duy nhất trong mỗi cuộc bỏ phiếu, và mọi người dùng chỉ có thể bỏ phiếu một lần cho mỗi cuộc.

## Chức năng

### 1. **Flow cho Operator (Người vận hành)**

#### Bước 1: Khởi tạo contract

- **Hàm**: `constructor()`
- **Mô tả**: Operator (người triển khai contract) sẽ trở thành người quản lý duy nhất của contract.

#### Bước 2: Tạo cuộc bỏ phiếu mới

- **Hàm**: `createVote(uint256 _startTime, uint256 _endTime)`
- **Mô tả**: Tạo một cuộc bỏ phiếu mới với `voteId` tự động tăng dần, cùng với thời gian bắt đầu (`_startTime`) và thời gian kết thúc (`_endTime`). Cuộc bỏ phiếu mới có thể thêm ứng cử viên vào trước khi thời gian bắt đầu.
- **Sự kiện**: `VoteCreated(uint256 voteId, uint256 startTime, uint256 endTime)`

#### Bước 3: Thêm ứng cử viên cho cuộc bỏ phiếu

- **Hàm**: `addCandidate(uint256 voteId, string memory _name)`
- **Mô tả**: Thêm ứng cử viên vào cuộc bỏ phiếu được xác định bởi `voteId`. Phải thực hiện trước khi cuộc bỏ phiếu bắt đầu.
- **Sự kiện**: `CandidateAdded(uint256 voteId, uint256 candidateId, string name)`

#### Bước 4: Kết thúc cuộc bỏ phiếu (tùy chọn)

- **Hàm**: `endVote(uint256 voteId)`
- **Mô tả**: Đánh dấu cuộc bỏ phiếu đã kết thúc. Người dùng không thể bỏ phiếu sau khi cuộc bỏ phiếu đã kết thúc.

### 2. **Flow cho User (Người dùng)**

#### Bước 1: Kiểm tra thông tin ứng cử viên

- **Hàm**: `getCandidate(uint256 voteId, uint256 candidateId)`
- **Mô tả**: Lấy thông tin của ứng cử viên trong cuộc bỏ phiếu xác định, bao gồm tên và số phiếu của ứng cử viên.

#### Bước 2: Bỏ phiếu cho ứng cử viên

- **Hàm**: `vote(uint256 voteId, uint256 _candidateId)`
- **Mô tả**: Người dùng bỏ phiếu cho ứng cử viên bằng cách cung cấp `voteId` và `candidateId`. Mỗi người dùng chỉ có thể bỏ phiếu một lần cho mỗi cuộc bỏ phiếu.
- **Sự kiện**: `Voted(uint256 voteId, address voter, uint256 candidateId)`

## Tóm tắt các hàm và sự kiện:

| Vai trò      | Hàm             | Mục đích                                                       | Sự kiện          |
| ------------ | --------------- | -------------------------------------------------------------- | ---------------- |
| **Operator** | `constructor()` | Khởi tạo operator làm người vận hành contract                  | Không có sự kiện |
| **Operator** | `createVote`    | Tạo cuộc bỏ phiếu mới với thời gian bắt đầu và kết thúc        | `VoteCreated`    |
| **Operator** | `addCandidate`  | Thêm ứng cử viên vào cuộc bỏ phiếu trước khi bỏ phiếu bắt đầu  | `CandidateAdded` |
| **Operator** | `endVote`       | Đánh dấu cuộc bỏ phiếu là đã kết thúc                          | Không có sự kiện |
| **User**     | `getCandidate`  | Kiểm tra thông tin của một ứng cử viên trong một cuộc bỏ phiếu | Không có sự kiện |
| **User**     | `vote`          | Bỏ phiếu cho ứng cử viên trong cuộc bỏ phiếu                   | `Voted`          |

---

### LOG

```log
$ hardhat run scripts/deploy.ts --network bscTestnet
Compiled 1 Solidity file successfully (evm target: paris).
Deploying contracts with the account: 0xaC05f1bC30D927D12D2166d62E8dAC8Da3E6A36b
MultiContestVoting deployed to: 0xD8dC58160B5dB7eEe239365D2Df78373923682d8
```

### Lưu ý

- **Bỏ phiếu chỉ có hiệu lực trong thời gian quy định**: Người dùng chỉ có thể bỏ phiếu trong khoảng thời gian từ `startTime` đến `endTime` của mỗi cuộc bỏ phiếu.
- **Một lần bỏ phiếu cho mỗi người dùng**: Mỗi người dùng chỉ có thể bỏ phiếu một lần cho mỗi cuộc bỏ phiếu.
- **Thêm ứng cử viên**: Chỉ có thể thêm ứng cử viên trước khi cuộc bỏ phiếu bắt đầu.

Contract này cho phép operator tạo nhiều cuộc bỏ phiếu độc lập, thuận tiện cho việc tổ chức nhiều chương trình bầu chọn khác nhau.
