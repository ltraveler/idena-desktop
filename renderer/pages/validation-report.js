import {
  Box,
  CloseButton,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  useTheme,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {UserInlineCard} from '../screens/profile/components'
import {
  ValidationReportBlockOverview,
  ValidationReportCategoryLabel,
  ValidationReportColumn,
  ValidationReportGauge,
  ValidationReportGaugeBar,
  ValidationReportGaugeBox,
  ValidationReportGaugeIcon,
  ValidationReportGaugeStat,
  ValidationReportGaugeStatLabel,
  ValidationReportGaugeStatValue,
  ValidationReportStat,
} from '../screens/validation-report/components'
import {useValidationReportSummary} from '../screens/validation-report/hooks'
import {
  ExternalLink,
  FailAlert,
  Page,
  PageTitle,
  SuccessAlert,
} from '../shared/components/components'
import Layout from '../shared/components/layout'
import {Table, TableHeaderCol} from '../shared/components/table'
import {useEpochState} from '../shared/providers/epoch-context'
import {useIdentity} from '../shared/providers/identity-context'
import {toLocaleDna, toPercent} from '../shared/utils/utils'

export default function ValidationReport() {
  const {t, i18n} = useTranslation()

  const {colors} = useTheme()

  const epoch = useEpochState()
  const [identity] = useIdentity()

  const {address, state, isValidated} = identity

  const {
    lastValidationScore,
    totalScore,
    earnings,
    earningsScore,
    validationReward,
    missedValidationReward,
    invitationReward,
    missedInvitationReward,
    flipReward,
    missedFlipReward,
    flipReportReward,
    missedFlipReportReward,
    totalMissedReward,
    didMissValidation,
    validationPenalty,
    isLoading,
  } = useValidationReportSummary()

  const {
    short: {score: shortScore, options: shortAnswersCount, ...shortResults},
    long: {score: longScore, ...longResults},
  } = lastValidationScore

  const dna = toLocaleDna(i18n.language, {maximumFractionDigits: 3})

  const rawDna = amount =>
    !amount || Number.isNaN(amount)
      ? '–'
      : amount.toLocaleString(i18n.language, {maximumFractionDigits: 3})

  // eslint-disable-next-line no-nested-ternary
  const validationFailReason = didMissValidation
    ? shortAnswersCount
      ? t('Late submission')
      : t('Missed validation')
    : t('Wrong answers')

  return (
    <Layout>
      <Page as={Stack} spacing={8}>
        <Flex justify="space-between" align="center" w="full">
          <PageTitle m={0}>
            {t('Epoch #{{epochNumber}} validation report', {
              epochNumber: epoch?.epoch,
            })}
          </PageTitle>
          <CloseButton />
        </Flex>
        <Stack spacing={6} w="full">
          <Box>
            <Skeleton
              isLoaded={!isLoading}
              colorStart={colors.gray[50]}
              colorEnd={colors.gray[300]}
              alignSelf="start"
            >
              {isValidated ? (
                <SuccessAlert>
                  {validationPenalty
                    ? t('Validated')
                    : t('Successfully validated')}
                </SuccessAlert>
              ) : (
                <FailAlert>{t('Validation failed')}</FailAlert>
              )}
            </Skeleton>
          </Box>
          <Box py={2}>
            <UserInlineCard address={address} status={state} />
          </Box>
          <Stack isInline spacing={10}>
            <ValidationReportBlockOverview>
              <Stack spacing={45}>
                <Box>
                  <ValidationReportGauge>
                    <ValidationReportGaugeBox>
                      {isValidated ? (
                        <ValidationReportGaugeBar
                          value={totalScore * 100}
                          color={
                            // eslint-disable-next-line no-nested-ternary
                            totalScore <= 0.75
                              ? colors.red[500]
                              : totalScore <= 0.9
                              ? colors.orange[500]
                              : colors.green[500]
                          }
                          bg={colors.brandGray['005']}
                        />
                      ) : (
                        <ValidationReportGaugeBar
                          value={shortScore || 2}
                          color={colors.red[500]}
                          bg={colors.brandGray['005']}
                        />
                      )}
                      <ValidationReportGaugeIcon icon="timer" />
                    </ValidationReportGaugeBox>
                    <ValidationReportGaugeStat>
                      {isValidated ? (
                        <ValidationReportGaugeStatValue>
                          {toPercent(totalScore)}
                        </ValidationReportGaugeStatValue>
                      ) : (
                        <ValidationReportGaugeStatValue color="red.500">
                          {t('Failed')}
                        </ValidationReportGaugeStatValue>
                      )}
                      <ValidationReportGaugeStatLabel>
                        {isValidated ? t('Score') : validationFailReason}
                      </ValidationReportGaugeStatLabel>
                    </ValidationReportGaugeStat>
                  </ValidationReportGauge>
                </Box>
                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Short session')}
                      value={t('{{score}} ({{point}} out of {{flipsCount}})', {
                        score: toPercent(shortScore),
                        ...shortResults,
                      })}
                    />
                    <ValidationReportStat
                      label={t('Long session')}
                      value={t('{{score}} ({{point}} out of {{flipsCount}})', {
                        score: toPercent(longScore),
                        ...longResults,
                      })}
                    />
                  </Flex>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Total score')}
                      value={toPercent(totalScore)}
                    />
                  </Flex>
                </Stack>
              </Stack>
            </ValidationReportBlockOverview>
            <ValidationReportBlockOverview>
              <Stack spacing={45}>
                <Box>
                  <ValidationReportGauge>
                    <ValidationReportGaugeBox>
                      {isValidated ? (
                        <ValidationReportGaugeBar
                          value={earningsScore * 100 || 2}
                          color={
                            // eslint-disable-next-line no-nested-ternary
                            earningsScore <= 0.5
                              ? colors.red[500]
                              : earningsScore <= 0.75
                              ? colors.orange[500]
                              : colors.green[500]
                          }
                          bg={colors.brandGray['005']}
                        />
                      ) : (
                        <ValidationReportGaugeBar
                          value={2}
                          color={colors.red[500]}
                          bg={colors.brandGray['005']}
                        />
                      )}
                      <ValidationReportGaugeIcon icon="send-out" />
                    </ValidationReportGaugeBox>
                    <ValidationReportGaugeStat>
                      {isValidated ? (
                        <ValidationReportGaugeStatValue>
                          {dna(earnings)}
                        </ValidationReportGaugeStatValue>
                      ) : (
                        <ValidationReportGaugeStatValue color="red.500">
                          {dna(-totalMissedReward)}
                        </ValidationReportGaugeStatValue>
                      )}
                      <ValidationReportGaugeStatLabel>
                        {t('Earnings')}
                      </ValidationReportGaugeStatLabel>
                    </ValidationReportGaugeStat>
                  </ValidationReportGauge>
                </Box>
                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Missed invitation earnings')}
                      value={dna(missedInvitationReward)}
                    />
                    <ValidationReportStat
                      label={t('Missed reporting earnings')}
                      value={dna(missedFlipReportReward)}
                    />
                  </Flex>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Missed flip earnings')}
                      value={dna(missedFlipReward)}
                    />
                  </Flex>
                </Stack>
              </Stack>
            </ValidationReportBlockOverview>
          </Stack>
          <Stack spacing={5}>
            <Box>
              <Heading color="brandGray.500" fontSize="lg" fontWeight={500}>
                {t('Earnings summary')}
              </Heading>
              <ExternalLink
                href={`https://scan.idena.io/identity/${address}/epoch/${
                  epoch?.epoch
                }/${isValidated ? 'rewards' : 'validation'}`}
              >
                {t('See the full report in blockchain explorer')}
              </ExternalLink>
            </Box>
            <Table fontWeight={500}>
              <thead>
                <tr>
                  <TableHeaderCol>{t('Category')}</TableHeaderCol>
                  <TableHeaderCol>{t('Earned, iDNA')}</TableHeaderCol>
                  <TableHeaderCol>{t('Missed, iDNA')}</TableHeaderCol>
                  <TableHeaderCol style={{width: '260px'}}>
                    {t('How to get maximum reward')}
                  </TableHeaderCol>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Validation')}
                      description={t('Rewards for the successfull validation')}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(validationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedValidationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {validationPenalty ? (
                      <Text color="red.500">
                        {t('Your flips were reported. Make flips carefully')}
                      </Text>
                    ) : missedValidationReward ? (
                      t('Attend every validation to get a higher reward')
                    ) : (
                      <Text color="green.500">
                        {t('Great job! You have earned maximum reward')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Flips')}
                      description={t(
                        'Rewards for submitted and qualified flips'
                      )}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(flipReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedFlipReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {validationPenalty ? (
                      <Text color="red.500">
                        {t('Your flips were reported. Make flips carefully')}
                      </Text>
                    ) : missedFlipReward ? (
                      t('Make flips carefully')
                    ) : (
                      <Text color="green.500">
                        {t('Great job! You have earned maximum reward')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Invitations')}
                      description={t('Rewards for invitee validation')}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(invitationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedInvitationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {validationPenalty ? (
                      <Text color="red.500">
                        {t('Your flips were reported. Make flips carefully')}
                      </Text>
                    ) : missedFlipReward ? (
                      t(
                        'Invite your friends and help them to pass the first 3 validations'
                      )
                    ) : (
                      <Text color="green.500">
                        {t('Great job! You have earned maximum reward')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Flip reports')}
                      description={t('Rewards for reporting bad flips')}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(flipReportReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedFlipReportReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {validationPenalty ? (
                      <Text color="red.500">
                        {t('Your flips were reported. Make flips carefully')}
                      </Text>
                    ) : missedFlipReportReward ? (
                      t('Report all flips that break the rules')
                    ) : (
                      <Text color="green.500">
                        {t('Great job! You have earned maximum reward')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
              </tbody>
            </Table>
          </Stack>
        </Stack>
      </Page>
    </Layout>
  )
}
