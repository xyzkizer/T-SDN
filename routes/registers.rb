class ServiceRegisterController < SDN

  get '/' do
    content_type :json

    @registers = []
    adapter = DataMapper.repository(:default).adapter
    results = adapter.select("SELECT `id`, `service`, `rate`, `bandwidth`, `effective_date`, `start_at`, `end_at`, `everyday` FROM `t_service_register` ORDER BY `id`")

    register = '{"id":%s,"service":"%s","rate":%s,"bandwidth":%s,"effective_date":"%s","start_at":"%s", "end_at":"%s","everyday":%s}'

    user = Manager.first(:id => session['user_id'])

    user_services = Service.all(:manager_id => session['user_id']).map { |s|
      s.service_id
    }
    results.each do |r|
      next unless user.role == "admin" and user_services.include? r.service
      @registers << JSON.parse(register % [r.id,r.service,r.rate,r.bandwidth,r.effective_date,r.start_at,r.end_at,r.everyday])
    end

    %Q({"count":#{@registers.length}, "data":#{@registers.to_json}})
  end

  delete %r{/(?<ids>.+)/?} do
    content_type :json
    logger.debug params.inspect

    # registers = Register.all(:fields => [:id])
    # registers.each do |r|
    #   r.tasks(:fields => [:id]).destroy
    # end

    adapter = DataMapper.repository(:default).adapter
    adapter.execute("DELETE FROM `t_service_register` where `id` IN (%s)" % params['ids'])
    adapter.execute("DELETE FROM `t_service_tasklist` where `register_id` IN (%s)" % params['ids'])

    # if deleted.affected_rows > 0
    [200, %Q({"message":"done!"})]
    # else
    #   [500, %Q({"message":"failure!"})]
    # end
  end

  post '/' do
    content_type :json
    logger.debug params.inspect

    @register = Register.create(
      :service => params['service']['name'][0]['value'],
      :rate => params['rate'],
      :bandwidth => params['bandwidth'],
      :effective_date => params['date'],
      :startAt => params['startAt'],
      :endAt => params['endAt'],
      :everyday => params['everyday']
    )
    Service.create(
      :service_id => params['service']['name'][0]['value'],
      :manager_id => session['user_id']
    )

    content = '{"connConstraint":{"requestedCapacity":{"committedInformationRate":%s,"totalSize":%s}}}'
    if params['everyday']
      @register.tasks.create(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_time => params['startAt'],
        :content => content % [params['rate'], params['bandwidth']],
        :state => 0
      )

      @register.tasks.create(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_time => params['endAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )
    else
      @register.tasks.create(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_date => params['date'],
        :effective_time => params['startAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )

      @register.tasks.create(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_date => params['date'],
        :effective_time => params['endAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )
    end

    if @register
      [200, %Q({"message":"done!"})]
    else
      @register.errors.each do |e|
        logger.debug e
      end
      [500, %Q({"message":"failure!"})]
    end

  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
